package gqlerrors

import (
	"github.com/nhan-ng/sudoku/internal/cmd/gameserver/graph/model"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

func ErrInvalidInputCoordinate() error {
	return gqlerror.Errorf("invalid input coordinate")
}

func ErrInvalidInputValue() error {
	return gqlerror.Errorf("invalid input value")
}

func ErrCommitNotFound(id string) error {
	return gqlerror.Errorf("commit with id '%s' not found", id)
}

func ErrBlobtNotFound(id string) error {
	return gqlerror.Errorf("blob with id '%s' not found", id)
}

func ErrBranchNotFound(id string) error {
	return gqlerror.Errorf("branch with id '%s' not found", id)
}

func ErrBranchObserverAlreadyExists(observerID, BranchID string) error {
	return gqlerror.Errorf("observer '%s' for branch '%s' already exists", observerID, BranchID)
}

func ErrBranchAlreadyExists(BranchID string) error {
	return gqlerror.Errorf("branch with id '%s' already exists", BranchID)
}

func ErrInvalidInputCommitType(commitType model.CommitType) error {
	return gqlerror.Errorf("invalid commit type '%s'", commitType)
}
