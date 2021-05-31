import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  split,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";

export type NewClientOpts = {
  address: string;
  withSubscription?: boolean;
};

export const newClient = ({
  address,
  withSubscription,
}: NewClientOpts): ApolloClient<NormalizedCacheObject> => {
  let link: ApolloLink;
  const httpLink = new HttpLink({
    uri: `http://${address}`,
  });
  link = httpLink;

  if (withSubscription) {
    const wsLink = new WebSocketLink({
      uri: `ws://${address}`,
      options: {
        reconnect: true,
      },
    });
    link = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink
    );
  }

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link,
  });

  return client;
};
