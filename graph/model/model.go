package model

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
}

type Sudoku struct {
	RefHeadID string  `json:"refHeadId"`
	Board     [][]int `json:"board"`
}
