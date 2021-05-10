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






export type Blob = {
  __typename: 'Blob';
  board: Array<Array<Cell>>;
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
  parentId?: Maybe<Scalars['ID']>;
  parent?: Maybe<Commit>;
  blob: Blob;
  type: CommitType;
  row: Scalars['Int'];
  col: Scalars['Int'];
  val: Scalars['Int'];
};

export type CommitInput = {
  refHeadId: Scalars['ID'];
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

export type Mutation = {
  __typename: 'Mutation';
  commit: Commit;
};


export type MutationCommitArgs = {
  input: CommitInput;
};

export type Query = {
  __typename: 'Query';
  sudoku: Sudoku;
  refHead: RefHead;
  commit: Commit;
};


export type QueryRefHeadArgs = {
  id: Scalars['ID'];
};


export type QueryCommitArgs = {
  id: Scalars['ID'];
};

export type RefHead = {
  __typename: 'RefHead';
  id: Scalars['ID'];
  commitId: Scalars['ID'];
  commit: Commit;
  commits: Array<Commit>;
};

export type Subscription = {
  __typename: 'Subscription';
  commitAdded: Commit;
};


export type SubscriptionCommitAddedArgs = {
  refHeadId: Scalars['ID'];
};

export type Sudoku = {
  __typename: 'Sudoku';
  refHeadId: Scalars['ID'];
  refHead: RefHead;
  board: Array<Array<Scalars['Int']>>;
};




export type GetSudokuQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSudokuQuery = (
  { __typename: 'Query' }
  & { sudoku: (
    { __typename: 'Sudoku' }
    & Pick<Sudoku, 'board'>
    & { refHead: (
      { __typename: 'RefHead' }
      & LiteRefHeadFragment
    ) }
  ) }
);

export type GetLiteRefHeadQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetLiteRefHeadQuery = (
  { __typename: 'Query' }
  & { refHead: (
    { __typename: 'RefHead' }
    & LiteRefHeadFragment
  ) }
);

export type GetFullRefHeadQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetFullRefHeadQuery = (
  { __typename: 'Query' }
  & { refHead: (
    { __typename: 'RefHead' }
    & FullRefHeadFragment
  ) }
);

export type LiteRefHeadFragment = (
  { __typename: 'RefHead' }
  & Pick<RefHead, 'id'>
  & { commit: (
    { __typename: 'Commit' }
    & CommitFragment
  ) }
);

export type FullRefHeadFragment = (
  { __typename: 'RefHead' }
  & { commits: Array<(
    { __typename: 'Commit' }
    & CommitFragment
  )> }
  & LiteRefHeadFragment
);

export type AddCommitMutationVariables = Exact<{
  input: CommitInput;
}>;


export type AddCommitMutation = (
  { __typename: 'Mutation' }
  & { commit: (
    { __typename: 'Commit' }
    & CommitFragment
  ) }
);

export type OnCommitAddedSubscriptionVariables = Exact<{
  refHeadId: Scalars['ID'];
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
  & Pick<Commit, 'id' | 'type' | 'row' | 'col' | 'val'>
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
}
    ${CommitBlobFragmentDoc}`;
export const LiteRefHeadFragmentDoc = gql`
    fragment LiteRefHead on RefHead {
  id
  commit {
    ...Commit
  }
}
    ${CommitFragmentDoc}`;
export const FullRefHeadFragmentDoc = gql`
    fragment FullRefHead on RefHead {
  ...LiteRefHead
  commits {
    ...Commit
  }
}
    ${LiteRefHeadFragmentDoc}
${CommitFragmentDoc}`;
export const GetSudokuDocument = gql`
    query GetSudoku {
  sudoku {
    board
    refHead {
      ...LiteRefHead
    }
  }
}
    ${LiteRefHeadFragmentDoc}`;

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
export const GetLiteRefHeadDocument = gql`
    query GetLiteRefHead($id: ID!) {
  refHead(id: $id) {
    ...LiteRefHead
  }
}
    ${LiteRefHeadFragmentDoc}`;

/**
 * __useGetLiteRefHeadQuery__
 *
 * To run a query within a React component, call `useGetLiteRefHeadQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLiteRefHeadQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLiteRefHeadQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetLiteRefHeadQuery(baseOptions: Apollo.QueryHookOptions<GetLiteRefHeadQuery, GetLiteRefHeadQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLiteRefHeadQuery, GetLiteRefHeadQueryVariables>(GetLiteRefHeadDocument, options);
      }
export function useGetLiteRefHeadLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLiteRefHeadQuery, GetLiteRefHeadQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLiteRefHeadQuery, GetLiteRefHeadQueryVariables>(GetLiteRefHeadDocument, options);
        }
export type GetLiteRefHeadQueryHookResult = ReturnType<typeof useGetLiteRefHeadQuery>;
export type GetLiteRefHeadLazyQueryHookResult = ReturnType<typeof useGetLiteRefHeadLazyQuery>;
export type GetLiteRefHeadQueryResult = Apollo.QueryResult<GetLiteRefHeadQuery, GetLiteRefHeadQueryVariables>;
export const GetFullRefHeadDocument = gql`
    query GetFullRefHead($id: ID!) {
  refHead(id: $id) {
    ...FullRefHead
  }
}
    ${FullRefHeadFragmentDoc}`;

/**
 * __useGetFullRefHeadQuery__
 *
 * To run a query within a React component, call `useGetFullRefHeadQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFullRefHeadQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFullRefHeadQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetFullRefHeadQuery(baseOptions: Apollo.QueryHookOptions<GetFullRefHeadQuery, GetFullRefHeadQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFullRefHeadQuery, GetFullRefHeadQueryVariables>(GetFullRefHeadDocument, options);
      }
export function useGetFullRefHeadLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFullRefHeadQuery, GetFullRefHeadQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFullRefHeadQuery, GetFullRefHeadQueryVariables>(GetFullRefHeadDocument, options);
        }
export type GetFullRefHeadQueryHookResult = ReturnType<typeof useGetFullRefHeadQuery>;
export type GetFullRefHeadLazyQueryHookResult = ReturnType<typeof useGetFullRefHeadLazyQuery>;
export type GetFullRefHeadQueryResult = Apollo.QueryResult<GetFullRefHeadQuery, GetFullRefHeadQueryVariables>;
export const AddCommitDocument = gql`
    mutation AddCommit($input: CommitInput!) {
  commit(input: $input) {
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
export const OnCommitAddedDocument = gql`
    subscription OnCommitAdded($refHeadId: ID!) {
  commitAdded(refHeadId: $refHeadId) {
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
 *      refHeadId: // value for 'refHeadId'
 *   },
 * });
 */
export function useOnCommitAddedSubscription(baseOptions: Apollo.SubscriptionHookOptions<OnCommitAddedSubscription, OnCommitAddedSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnCommitAddedSubscription, OnCommitAddedSubscriptionVariables>(OnCommitAddedDocument, options);
      }
export type OnCommitAddedSubscriptionHookResult = ReturnType<typeof useOnCommitAddedSubscription>;
export type OnCommitAddedSubscriptionResult = Apollo.SubscriptionResult<OnCommitAddedSubscription>;