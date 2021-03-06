// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

import (
	"fmt"
	"io"
	"strconv"
)

type AddBranchInput struct {
	ID       string  `json:"id"`
	CommitID *string `json:"commitId"`
	BranchID *string `json:"branchId"`
}

type AddBranchPayload struct {
	Branch *Branch `json:"branch"`
}

type AddCommitInput struct {
	BranchID string     `json:"branchId"`
	Type     CommitType `json:"type"`
	Row      int        `json:"row"`
	Col      int        `json:"col"`
	Val      *int       `json:"val"`
}

type AddCommitPayload struct {
	Commit *Commit `json:"commit"`
}

type JoinPayload struct {
	Player *Player `json:"player"`
}

type MergeBranchInput struct {
	SourceBranchID string `json:"sourceBranchId"`
	TargetBranchID string `json:"targetBranchId"`
	AuthorID       string `json:"authorId"`
}

type MergeBranchPayload struct {
	SourceBranch *Branch `json:"sourceBranch"`
}

type Player struct {
	ID          string `json:"id"`
	DisplayName string `json:"displayName"`
}

type CommitType string

const (
	CommitTypeUnknown    CommitType = "UNKNOWN"
	CommitTypeInitial    CommitType = "INITIAL"
	CommitTypeAddFill    CommitType = "ADD_FILL"
	CommitTypeRemoveFill CommitType = "REMOVE_FILL"
	CommitTypeToggleNote CommitType = "TOGGLE_NOTE"
	CommitTypeMerge      CommitType = "MERGE"
)

var AllCommitType = []CommitType{
	CommitTypeUnknown,
	CommitTypeInitial,
	CommitTypeAddFill,
	CommitTypeRemoveFill,
	CommitTypeToggleNote,
	CommitTypeMerge,
}

func (e CommitType) IsValid() bool {
	switch e {
	case CommitTypeUnknown, CommitTypeInitial, CommitTypeAddFill, CommitTypeRemoveFill, CommitTypeToggleNote, CommitTypeMerge:
		return true
	}
	return false
}

func (e CommitType) String() string {
	return string(e)
}

func (e *CommitType) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = CommitType(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid CommitType", str)
	}
	return nil
}

func (e CommitType) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}
