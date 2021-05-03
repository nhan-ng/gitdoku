package model

import (
	"sync"

	"github.com/nhan-ng/sudoku/graph/errors"
)

type AddObserverCleanUpFunc func()

type Commit struct {
	ID       string  `json:"id"`
	ParentID *string `json:"parentId"`
	Row      int     `json:"row"`
	Col      int     `json:"col"`
	Val      int     `json:"val"`
}

type RefHead struct {
	ID       string  `json:"id"`
	CommitID *string `json:"commitId"`

	observers map[string]chan *Commit
	lock      sync.Mutex
}

type Sudoku struct {
	RefHeadID string  `json:"refHeadId"`
	Board     [][]int `json:"board"`
}

func NewRefHead(id string) *RefHead {
	return &RefHead{
		ID:        id,
		observers: make(map[string]chan *Commit),
	}
}

func (s *Sudoku) HasConflictWithFixedBoard(row, col int) bool {
	return s.Board[row][col] != 0
}

func (r *RefHead) AddCommit(commit *Commit) {
	r.lock.Lock()
	defer r.lock.Unlock()

	// Add the commit
	commit.ParentID = r.CommitID
	r.CommitID = &commit.ID

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
		return nil, nil, errors.ErrRefHeadObserverAlreadyExists(observerID, r.ID)
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
