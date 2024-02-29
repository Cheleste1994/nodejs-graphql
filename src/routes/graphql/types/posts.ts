import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLFloat } from 'graphql';
import { UUIDType } from './uuid.js';

export const PostsTypes = new GraphQLObjectType({
  name: 'Posts',
  fields: {
    id: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
  },
});
