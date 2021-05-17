import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Time: string;
  _Any: any;
  _FieldSet: any;
};






export type AddBranchInput = {
  id: Scalars['ID'];
  commitId?: Maybe<Scalars['ID']>;
  branchId?: Maybe<Scalars['ID']>;
};

export type AddCommitInput = {
  branchId: Scalars['ID'];
  type: CommitType;
  row: Scalars['Int'];
  col: Scalars['Int'];
  val: Scalars['Int'];
};

export type Blob = {
  __typename: 'Blob';
  board: Array<Array<Cell>>;
};

export type Branch = {
  __typename: 'Branch';
  id: Scalars['ID'];
  commitId: Scalars['ID'];
  commit: Commit;
  commits: Array<Commit>;
};

export type Cell = {
  __typename: 'Cell';
  immutable: Scalars['Boolean'];
  val: Scalars['Int'];
  notes: Array<Scalars['Int']>;
};

export type Commit = {
  __typename: 'Commit';
  id: Scalars['ID'];
  authorId: Scalars['ID'];
  authorTimestamp: Scalars['Time'];
  parentIds: Array<Scalars['ID']>;
  parents: Array<Commit>;
  blob: Blob;
  type: CommitType;
  row: Scalars['Int'];
  col: Scalars['Int'];
  val: Scalars['Int'];
};

export enum CommitType {
  Unknown = 'UNKNOWN',
  Initial = 'INITIAL',
  AddFill = 'ADD_FILL',
  RemoveFill = 'REMOVE_FILL',
  AddNote = 'ADD_NOTE',
  RemoveNote = 'REMOVE_NOTE'
}

export type MergeBranchInput = {
  sourceBranchId: Scalars['ID'];
  targetBranchId: Scalars['ID'];
  authorId: Scalars['ID'];
};

export type Mutation = {
  __typename: 'Mutation';
  addCommit: Commit;
  addBranch: Branch;
  mergeBranch: Branch;
};


export type MutationAddCommitArgs = {
  input: AddCommitInput;
};


export type MutationAddBranchArgs = {
  input: AddBranchInput;
};


export type MutationMergeBranchArgs = {
  input: MergeBranchInput;
};

export type Query = {
  __typename: 'Query';
  sudoku: Sudoku;
  branch: Branch;
  branches: Array<Branch>;
  commit: Commit;
};


export type QueryBranchArgs = {
  id: Scalars['ID'];
};


export type QueryCommitArgs = {
  id: Scalars['ID'];
};

export type Subscription = {
  __typename: 'Subscription';
  commitAdded: Commit;
};


export type SubscriptionCommitAddedArgs = {
  branchId: Scalars['ID'];
};

export type Sudoku = {
  __typename: 'Sudoku';
  branchId: Scalars['ID'];
  branch: Branch;
  board: Array<Array<Scalars['Int']>>;
};




export type GetSudokuQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSudokuQuery = (
  { __typename: 'Query' }
  & { sudoku: (
    { __typename: 'Sudoku' }
    & Pick<Sudoku, 'board'>
    & { branch: (
      { __typename: 'Branch' }
      & LiteBranchFragment
    ) }
  ) }
);

export type GetLiteBranchQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetLiteBranchQuery = (
  { __typename: 'Query' }
  & { branch: (
    { __typename: 'Branch' }
    & LiteBranchFragment
  ) }
);

export type GetFullBranchQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetFullBranchQuery = (
  { __typename: 'Query' }
  & { branch: (
    { __typename: 'Branch' }
    & FullBranchFragment
  ) }
);

export type GetBranchesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBranchesQuery = (
  { __typename: 'Query' }
  & { branches: Array<(
    { __typename: 'Branch' }
    & LiteBranchFragment
  )> }
);

export type LiteBranchFragment = (
  { __typename: 'Branch' }
  & Pick<Branch, 'id'>
  & { commit: (
    { __typename: 'Commit' }
    & CommitFragment
  ) }
);

export type FullBranchFragment = (
  { __typename: 'Branch' }
  & { commits: Array<(
    { __typename: 'Commit' }
    & CommitFragment
  )> }
  & LiteBranchFragment
);

export type AddCommitMutationVariables = Exact<{
  input: AddCommitInput;
}>;


export type AddCommitMutation = (
  { __typename: 'Mutation' }
  & { addCommit: (
    { __typename: 'Commit' }
    & CommitFragment
  ) }
);

export type AddBranchMutationVariables = Exact<{
  input: AddBranchInput;
}>;


export type AddBranchMutation = (
  { __typename: 'Mutation' }
  & { addBranch: (
    { __typename: 'Branch' }
    & LiteBranchFragment
  ) }
);

export type MergeBranchMutationVariables = Exact<{
  input: MergeBranchInput;
}>;


export type MergeBranchMutation = (
  { __typename: 'Mutation' }
  & { mergeBranch: (
    { __typename: 'Branch' }
    & LiteBranchFragment
  ) }
);

export type OnCommitAddedSubscriptionVariables = Exact<{
  branchId: Scalars['ID'];
}>;


export type OnCommitAddedSubscription = (
  { __typename: 'Subscription' }
  & { commitAdded: (
    { __typename: 'Commit' }
    & CommitFragment
  ) }
);

export type CommitFragment = (
  { __typename: 'Commit' }
  & Pick<Commit, 'id' | 'type' | 'row' | 'col' | 'val' | 'authorId' | 'authorTimestamp'>
  & CommitBlobFragment
);

export type CommitBlobFragment = (
  { __typename: 'Commit' }
  & { blob: (
    { __typename: 'Blob' }
    & { board: Array<Array<(
      { __typename: 'Cell' }
      & Pick<Cell, 'immutable' | 'val' | 'notes'>
    )>> }
  ) }
);

export const CommitBlobFragmentDoc = gql`
    fragment CommitBlob on Commit {
  blob {
    board {
      immutable
      val
      notes
    }
  }
}
    `;
export const CommitFragmentDoc = gql`
    fragment Commit on Commit {
  id
  ...CommitBlob
  type
  row
  col
  val
  authorId
  authorTimestamp
}
    ${CommitBlobFragmentDoc}`;
export const LiteBranchFragmentDoc = gql`
    fragment LiteBranch on Branch {
  id
  commit {
    ...Commit
  }
}
    ${CommitFragmentDoc}`;
export const FullBranchFragmentDoc = gql`
    fragment FullBranch on Branch {
  ...LiteBranch
  commits {
    ...Commit
  }
}
    ${LiteBranchFragmentDoc}
${CommitFragmentDoc}`;
export const GetSudokuDocument = gql`
    query GetSudoku {
  sudoku {
    board
    branch {
      ...LiteBranch
    }
  }
}
    ${LiteBranchFragmentDoc}`;

/**
 * __useGetSudokuQuery__
 *
 * To run a query within a React component, call `useGetSudokuQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSudokuQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSudokuQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSudokuQuery(baseOptions?: Apollo.QueryHookOptions<GetSudokuQuery, GetSudokuQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSudokuQuery, GetSudokuQueryVariables>(GetSudokuDocument, options);
      }
export function useGetSudokuLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSudokuQuery, GetSudokuQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSudokuQuery, GetSudokuQueryVariables>(GetSudokuDocument, options);
        }
export type GetSudokuQueryHookResult = ReturnType<typeof useGetSudokuQuery>;
export type GetSudokuLazyQueryHookResult = ReturnType<typeof useGetSudokuLazyQuery>;
export type GetSudokuQueryResult = Apollo.QueryResult<GetSudokuQuery, GetSudokuQueryVariables>;
export const GetLiteBranchDocument = gql`
    query GetLiteBranch($id: ID!) {
  branch(id: $id) {
    ...LiteBranch
  }
}
    ${LiteBranchFragmentDoc}`;

/**
 * __useGetLiteBranchQuery__
 *
 * To run a query within a React component, call `useGetLiteBranchQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLiteBranchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLiteBranchQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetLiteBranchQuery(baseOptions: Apollo.QueryHookOptions<GetLiteBranchQuery, GetLiteBranchQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLiteBranchQuery, GetLiteBranchQueryVariables>(GetLiteBranchDocument, options);
      }
export function useGetLiteBranchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLiteBranchQuery, GetLiteBranchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLiteBranchQuery, GetLiteBranchQueryVariables>(GetLiteBranchDocument, options);
        }
export type GetLiteBranchQueryHookResult = ReturnType<typeof useGetLiteBranchQuery>;
export type GetLiteBranchLazyQueryHookResult = ReturnType<typeof useGetLiteBranchLazyQuery>;
export type GetLiteBranchQueryResult = Apollo.QueryResult<GetLiteBranchQuery, GetLiteBranchQueryVariables>;
export const GetFullBranchDocument = gql`
    query GetFullBranch($id: ID!) {
  branch(id: $id) {
    ...FullBranch
  }
}
    ${FullBranchFragmentDoc}`;

/**
 * __useGetFullBranchQuery__
 *
 * To run a query within a React component, call `useGetFullBranchQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFullBranchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFullBranchQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetFullBranchQuery(baseOptions: Apollo.QueryHookOptions<GetFullBranchQuery, GetFullBranchQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFullBranchQuery, GetFullBranchQueryVariables>(GetFullBranchDocument, options);
      }
export function useGetFullBranchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFullBranchQuery, GetFullBranchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFullBranchQuery, GetFullBranchQueryVariables>(GetFullBranchDocument, options);
        }
export type GetFullBranchQueryHookResult = ReturnType<typeof useGetFullBranchQuery>;
export type GetFullBranchLazyQueryHookResult = ReturnType<typeof useGetFullBranchLazyQuery>;
export type GetFullBranchQueryResult = Apollo.QueryResult<GetFullBranchQuery, GetFullBranchQueryVariables>;
export const GetBranchesDocument = gql`
    query GetBranches {
  branches {
    ...LiteBranch
  }
}
    ${LiteBranchFragmentDoc}`;

/**
 * __useGetBranchesQuery__
 *
 * To run a query within a React component, call `useGetBranchesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBranchesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBranchesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetBranchesQuery(baseOptions?: Apollo.QueryHookOptions<GetBranchesQuery, GetBranchesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBranchesQuery, GetBranchesQueryVariables>(GetBranchesDocument, options);
      }
export function useGetBranchesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBranchesQuery, GetBranchesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBranchesQuery, GetBranchesQueryVariables>(GetBranchesDocument, options);
        }
export type GetBranchesQueryHookResult = ReturnType<typeof useGetBranchesQuery>;
export type GetBranchesLazyQueryHookResult = ReturnType<typeof useGetBranchesLazyQuery>;
export type GetBranchesQueryResult = Apollo.QueryResult<GetBranchesQuery, GetBranchesQueryVariables>;
export const AddCommitDocument = gql`
    mutation AddCommit($input: AddCommitInput!) {
  addCommit(input: $input) {
    ...Commit
  }
}
    ${CommitFragmentDoc}`;
export type AddCommitMutationFn = Apollo.MutationFunction<AddCommitMutation, AddCommitMutationVariables>;

/**
 * __useAddCommitMutation__
 *
 * To run a mutation, you first call `useAddCommitMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddCommitMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addCommitMutation, { data, loading, error }] = useAddCommitMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddCommitMutation(baseOptions?: Apollo.MutationHookOptions<AddCommitMutation, AddCommitMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddCommitMutation, AddCommitMutationVariables>(AddCommitDocument, options);
      }
export type AddCommitMutationHookResult = ReturnType<typeof useAddCommitMutation>;
export type AddCommitMutationResult = Apollo.MutationResult<AddCommitMutation>;
export type AddCommitMutationOptions = Apollo.BaseMutationOptions<AddCommitMutation, AddCommitMutationVariables>;
export const AddBranchDocument = gql`
    mutation AddBranch($input: AddBranchInput!) {
  addBranch(input: $input) {
    ...LiteBranch
  }
}
    ${LiteBranchFragmentDoc}`;
export type AddBranchMutationFn = Apollo.MutationFunction<AddBranchMutation, AddBranchMutationVariables>;

/**
 * __useAddBranchMutation__
 *
 * To run a mutation, you first call `useAddBranchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddBranchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addBranchMutation, { data, loading, error }] = useAddBranchMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddBranchMutation(baseOptions?: Apollo.MutationHookOptions<AddBranchMutation, AddBranchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddBranchMutation, AddBranchMutationVariables>(AddBranchDocument, options);
      }
export type AddBranchMutationHookResult = ReturnType<typeof useAddBranchMutation>;
export type AddBranchMutationResult = Apollo.MutationResult<AddBranchMutation>;
export type AddBranchMutationOptions = Apollo.BaseMutationOptions<AddBranchMutation, AddBranchMutationVariables>;
export const MergeBranchDocument = gql`
    mutation MergeBranch($input: MergeBranchInput!) {
  mergeBranch(input: $input) {
    ...LiteBranch
  }
}
    ${LiteBranchFragmentDoc}`;
export type MergeBranchMutationFn = Apollo.MutationFunction<MergeBranchMutation, MergeBranchMutationVariables>;

/**
 * __useMergeBranchMutation__
 *
 * To run a mutation, you first call `useMergeBranchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMergeBranchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [mergeBranchMutation, { data, loading, error }] = useMergeBranchMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useMergeBranchMutation(baseOptions?: Apollo.MutationHookOptions<MergeBranchMutation, MergeBranchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MergeBranchMutation, MergeBranchMutationVariables>(MergeBranchDocument, options);
      }
export type MergeBranchMutationHookResult = ReturnType<typeof useMergeBranchMutation>;
export type MergeBranchMutationResult = Apollo.MutationResult<MergeBranchMutation>;
export type MergeBranchMutationOptions = Apollo.BaseMutationOptions<MergeBranchMutation, MergeBranchMutationVariables>;
export const OnCommitAddedDocument = gql`
    subscription OnCommitAdded($branchId: ID!) {
  commitAdded(branchId: $branchId) {
    ...Commit
  }
}
    ${CommitFragmentDoc}`;

/**
 * __useOnCommitAddedSubscription__
 *
 * To run a query within a React component, call `useOnCommitAddedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnCommitAddedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnCommitAddedSubscription({
 *   variables: {
 *      branchId: // value for 'branchId'
 *   },
 * });
 */
export function useOnCommitAddedSubscription(baseOptions: Apollo.SubscriptionHookOptions<OnCommitAddedSubscription, OnCommitAddedSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnCommitAddedSubscription, OnCommitAddedSubscriptionVariables>(OnCommitAddedDocument, options);
      }
export type OnCommitAddedSubscriptionHookResult = ReturnType<typeof useOnCommitAddedSubscription>;
export type OnCommitAddedSubscriptionResult = Apollo.SubscriptionResult<OnCommitAddedSubscription>;