package model

import (
	"sort"
	"sync"

	"github.com/nhan-ng/sudoku/graph/gqlerrors"
)

type AddObserverCleanUpFunc func()

type Commit struct {
	ID       string     `json:"id"`
	ParentID *string    `json:"parentId"`
	BlobID   string     `json:"blobId"`
	Type     CommitType `json:"type"`
	Row      int        `json:"row"`
	Col      int        `json:"col"`
	Val      int        `json:"val"`
	Blob     Blob       `json:"blob"`
}

type RefHead struct {
	ID       string    `json:"id"`
	CommitID string    `json:"commitId"`
	Commit   *Commit   `json:"commit"`
	Commits  []*Commit `json:"commits"`

	observers map[string]chan *Commit
	lock      sync.Mutex
}

type Sudoku struct {
	RefHeadID string  `json:"refHeadId"`
	Board     [][]int `json:"board"`
}

type Cell struct {
	Immutable bool  `json:"immutable"`
	Val       int   `json:"val"`
	Notes     []int `json:"notes"`
}

type Blob struct {
	Board [][]Cell `json:"board"`
}

func NewRefHead(id string, commit *Commit) *RefHead {
	return &RefHead{
		ID:       id,
		CommitID: commit.ID,
		Commit:   commit,
		Commits:  []*Commit{commit},

		observers: make(map[string]chan *Commit),
	}
}

func (s *Sudoku) HasConflictWithFixedBoard(row, col int) bool {
	return s.Board[row][col] != 0
}

func (r *RefHead) AddCommit(commit *Commit) {
	r.lock.Lock()
	defer r.lock.Unlock()

	// TODO: Make it better without a lot of allocations
	// Handle commit
	blob := r.Commit.Blob
	switch commit.Type {
	case CommitTypeAddFill:
		cell := blob.Board[commit.Row][commit.Col]
		cell.Val = commit.Val
		blob.Board[commit.Row][commit.Col] = cell

	case CommitTypeRemoveFill:
		cell := blob.Board[commit.Row][commit.Col]
		cell.Val = 0
		blob.Board[commit.Row][commit.Col] = cell

	case CommitTypeAddNote:
		cell := blob.Board[commit.Row][commit.Col]
		notes := make([]int, 0, len(cell.Notes))
		for _, note := range cell.Notes {
			if note == commit.Val {
				notes = cell.Notes
				break
			}

			notes = append(notes, note)
		}
		sort.Ints(notes)
		cell.Notes = notes
		blob.Board[commit.Row][commit.Col] = cell

	case CommitTypeRemoveNote:
		cell := blob.Board[commit.Row][commit.Col]
		notes := cell.Notes
		for i, note := range cell.Notes {
			if note == commit.Val {
				notes = append(cell.Notes[:i], cell.Notes[i+1:]...)
			}
		}
		sort.Ints(notes)
		cell.Notes = notes
		blob.Board[commit.Row][commit.Col] = cell
	}

	// Add the commit
	commit.ParentID = &r.CommitID
	commit.Blob = blob
	r.CommitID = commit.ID
	r.Commit = commit
	r.Commits = append(r.Commits, commit)

	// Notify observers
	for _, observer := range r.observers {
		observer <- commit
	}
}

func (r *RefHead) AddObserver(observerID string) (<-chan *Commit, AddObserverCleanUpFunc, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	_, exists := r.observers[observerID]
	if exists {
		return nil, nil, gqlerrors.ErrRefHeadObserverAlreadyExists(observerID, r.ID)
	}

	// Initialize the commits channel
	commitsChan := make(chan *Commit, 1)
	r.observers[observerID] = commitsChan

	// And its clean up func
	cleanUpFunc := func() {
		r.lock.Lock()
		defer r.lock.Unlock()
		delete(r.observers, observerID)
	}

	return commitsChan, cleanUpFunc, nil
}
