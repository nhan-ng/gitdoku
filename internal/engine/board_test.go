package engine

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestReadBoard_ValidRawSudoku_ReturnExpected(t *testing.T) {
	r := require.New(t)

	// Arrange
	input := `070308100
040100000
000090082
001000500
000000230
000283070
094005000
526000700
000000009`

	data := []byte(
		`00000000000 17000000000 00000000000 13000000000 00000000000 18000000000 11000000000 00000000000 00000000000
00000000000 14000000000 00000000000 11000000000 00000000000 00000000000 00000000000 00000000000 00000000000
00000000000 00000000000 00000000000 00000000000 19000000000 00000000000 00000000000 18000000000 12000000000
00000000000 00000000000 11000000000 00000000000 00000000000 00000000000 15000000000 00000000000 00000000000
00000000000 00000000000 00000000000 00000000000 00000000000 00000000000 12000000000 13000000000 00000000000
00000000000 00000000000 00000000000 12000000000 18000000000 13000000000 00000000000 17000000000 00000000000
00000000000 19000000000 14000000000 00000000000 00000000000 15000000000 00000000000 00000000000 00000000000
15000000000 12000000000 16000000000 00000000000 00000000000 00000000000 17000000000 00000000000 00000000000
00000000000 00000000000 00000000000 00000000000 00000000000 00000000000 00000000000 00000000000 19000000000
`)
	var want Board
	err := want.Unmarshal(data)
	r.NoError(err, "Unmarshal(data)")

	// Act
	got, err := ReadBoard(input)

	// Assert
	r.NoError(err, "ReadBoard")
	r.Equal(want, got, "got")
}

func TestBoardMarshal_ValidData_ReturnExpected(t *testing.T) {
	// Arrange
	var input Board = make([][]Cell, 9)
	for i := 0; i < 9; i++ {
		input[i] = make([]Cell, 9)
		for j := 0; j < 9; j++ {
			input[i][j] = Cell{
				immutable: j%2 == 0,
				value:     j + 1,
				notes:     make([]bool, 9),
			}
		}
	}

	want := []byte(
		`11000000000 02000000000 13000000000 04000000000 15000000000 06000000000 17000000000 08000000000 19000000000
11000000000 02000000000 13000000000 04000000000 15000000000 06000000000 17000000000 08000000000 19000000000
11000000000 02000000000 13000000000 04000000000 15000000000 06000000000 17000000000 08000000000 19000000000
11000000000 02000000000 13000000000 04000000000 15000000000 06000000000 17000000000 08000000000 19000000000
11000000000 02000000000 13000000000 04000000000 15000000000 06000000000 17000000000 08000000000 19000000000
11000000000 02000000000 13000000000 04000000000 15000000000 06000000000 17000000000 08000000000 19000000000
11000000000 02000000000 13000000000 04000000000 15000000000 06000000000 17000000000 08000000000 19000000000
11000000000 02000000000 13000000000 04000000000 15000000000 06000000000 17000000000 08000000000 19000000000
11000000000 02000000000 13000000000 04000000000 15000000000 06000000000 17000000000 08000000000 19000000000
`)

	// Act
	got, err := input.Marshal()

	// Assert
	r := require.New(t)
	r.NoError(err, "Marshal()")
	r.Equal(want, got, "got")
}

func TestCellMarshal_ValidData_ReturnExpected(t *testing.T) {
	testCases := []struct {
		name  string
		input Cell
		want  []byte
	}{
		{
			name: "Immutable",
			input: Cell{
				immutable: true,
				value:     3,
				notes:     make([]bool, 9),
			},
			want: []byte("13000000000"),
		},
		{
			name: "Mutable",
			input: Cell{
				immutable: false,
				value:     3,
				notes:     []bool{true, false, false, true, true, false, false, true, true},
			},
			want: []byte("03100110011"),
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Act
			got, err := tc.input.Marshal()

			// Assert
			r := require.New(t)
			r.NoError(err, "Marshal()")
			r.Equal(tc.want, got, "got")
		})
	}
}

func TestCellUnmarshal_ValidData_ReturnExpected(t *testing.T) {
	testCases := []struct {
		name  string
		input []byte
		want  Cell
	}{
		{
			name:  "Immutable",
			input: []byte("13000000000"),
			want: Cell{
				immutable: true,
				value:     3,
				notes:     make([]bool, 9),
			},
		},
		{
			name:  "Mutable",
			input: []byte("03100110011"),
			want: Cell{
				immutable: false,
				value:     3,
				notes:     []bool{true, false, false, true, true, false, false, true, true},
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Act
			var got Cell
			err := got.Unmarshal(tc.input)

			// Assert
			r := require.New(t)
			r.NoError(err, "Marshal()")
			r.Equal(tc.want, got, "got")
		})
	}
}

func TestNotesMarshal_ValidData_ReturnExpected(t *testing.T) {
	var input Notes = []bool{true, false, false, true, true, false, false, true, true}
	want := []byte("100110011")

	// Act
	got, err := input.Marshal()

	// Assert
	r := require.New(t)
	r.NoError(err, "Marshal()")
	r.Equal(want, got, "got")
}

func TestNotesUnmarshal_ValidData_ReturnExpected(t *testing.T) {
	input := []byte("100110011")
	var want Notes = []bool{true, false, false, true, true, false, false, true, true}

	// Act
	var got Notes
	err := got.Unmarshal(input)

	// Assert
	r := require.New(t)
	r.NoError(err, "Marshal()")
	r.Equal(want, got, "got")
}
