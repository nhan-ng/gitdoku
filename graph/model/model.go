package model

import (
	"time"
)

type AddObserverCleanUpFunc func()

type Commit struct {
	ID              string     `json:"id"`
	ParentIDs       []string   `json:"parentIds"`
	Type            CommitType `json:"type"`
	Row             int        `json:"row"`
	Col             int        `json:"col"`
	Val             int        `json:"val"`
	AuthorID        string     `json:"authorId"`
	AuthorTimestamp time.Time  `json:"authorTimestamp"`
}

type Branch struct {
	ID       string `json:"id"`
	CommitID string `json:"commitId"`
}

type Sudoku struct {
	BranchID string  `json:"branchId"`
	Board    [][]int `json:"board"`
}

type Cell struct {
	Immutable bool  `json:"immutable"`
	Val       int   `json:"val"`
	Notes     []int `json:"notes"`
}

type Blob struct {
	Board [][]Cell `json:"board"`
}

func NewBranch(id string, commit *Commit) *Branch {
	return &Branch{
		ID:       id,
		CommitID: commit.ID,
	}
}

func (s *Sudoku) HasConflictWithFixedBoard(row, col int) bool {
	return s.Board[row][col] != 0
}

//
//func (b *Branch) AddCommit(commit *Commit) {
//	b.lock.Lock()
//	defer b.lock.Unlock()
//
//	// TODO: Make it better without a lot of allocations
//	// Handle commit
//	var blob Blob
//	copier.CopyWithOption(&blob, &b.Commit.Blob, copier.Option{DeepCopy: true})
//	switch commit.Type {
//	case CommitTypeAddFill:
//		cell := blob.Board[commit.Row][commit.Col]
//		cell.Val = commit.Val
//		blob.Board[commit.Row][commit.Col] = cell
//
//	case CommitTypeRemoveFill:
//		cell := blob.Board[commit.Row][commit.Col]
//		cell.Val = 0
//		blob.Board[commit.Row][commit.Col] = cell
//
//	case CommitTypeAddNote:
//		cell := blob.Board[commit.Row][commit.Col]
//		notes := make([]int, 0, len(cell.Notes))
//		for _, note := range cell.Notes {
//			if note == commit.Val {
//				notes = cell.Notes
//				break
//			}
//
//			notes = append(notes, note)
//		}
//		sort.Ints(notes)
//		cell.Notes = notes
//		blob.Board[commit.Row][commit.Col] = cell
//
//	case CommitTypeRemoveNote:
//		cell := blob.Board[commit.Row][commit.Col]
//		notes := cell.Notes
//		for i, note := range cell.Notes {
//			if note == commit.Val {
//				notes = append(cell.Notes[:i], cell.Notes[i+1:]...)
//			}
//		}
//		sort.Ints(notes)
//		cell.Notes = notes
//		blob.Board[commit.Row][commit.Col] = cell
//	}
//
//	// Add the commit
//	parentID := b.CommitID
//	commit.ParentID = &parentID
//	commit.Blob = blob
//	commit.AuthorTimestamp = time.Now()
//	b.CommitID = commit.ID
//	b.Commit = commit
//
//	// Notify observers
//	for _, observer := range b.observers {
//		observer <- commit
//	}
//}
//
//func (b *Branch) AddObserver(observerID string) (<-chan *Commit, AddObserverCleanUpFunc, error) {
//	b.lock.Lock()
//	defer b.lock.Unlock()
//
//	_, exists := b.observers[observerID]
//	if exists {
//		return nil, nil, gqlerrors.ErrBranchObserverAlreadyExists(observerID, b.ID)
//	}
//
//	// Initialize the commits channel
//	commitsChan := make(chan *Commit, 1)
//	b.observers[observerID] = commitsChan
//
//	// And its clean up func
//	cleanUpFunc := func() {
//		b.lock.Lock()
//		defer b.lock.Unlock()
//		delete(b.observers, observerID)
//	}
//
//	return commitsChan, cleanUpFunc, nil
//}
