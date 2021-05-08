package gqlerrors

import "github.com/vektah/gqlparser/v2/gqlerror"

func ErrInvalidInputCoordinate() error {
	return gqlerror.Errorf("invalid input coordinate")
}

func ErrCommitNotFound(id string) error {
	return gqlerror.Errorf("commit with id '%s' not found", id)
}

func ErrBlobtNotFound(id string) error {
	return gqlerror.Errorf("blob with id '%s' not found", id)
}

func ErrRefHeadNotFound(id string) error {
	return gqlerror.Errorf("ref head with id '%s' not found", id)
}

func ErrRefHeadObserverAlreadyExists(observerID, refHeadID string) error {
	return gqlerror.Errorf("observer '%s' for ref head '%s' already exists", observerID, refHeadID)
}
