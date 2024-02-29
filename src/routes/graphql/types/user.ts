import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList } from 'graphql';
import { UUIDType } from './uuid.js';
import { ProfileTypes } from './profiles.js';
import { PostsTypes } from './posts.js';

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLInt },
    profile: {
      type: ProfileTypes,
      resolve: async ({ id }, _, { prisma }) => {
        const profile = await prisma.profile.findUnique({ where: { userId: id } });
        return profile;
      },
    },
    posts: {
      type: new GraphQLList(PostsTypes),
      resolve: async ({ id }, _, { prisma }) => {
        const posts = await prisma.post.findMany({ where: { authorId: id } });
        return posts;
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async ({ id }, _, { prisma }) => {
        const user = await prisma.user.findMany({
          where: {
            subscribedToUser: {
              some: {
                subscriberId: id,
              },
            },
          },
        });
        return user;
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async ({ id }, _, { prisma }) => {
        const user = await prisma.user.findMany({
          where: {
            userSubscribedTo: {
              some: {
                authorId: id,
              },
            },
          },
        });
        return user;
      },
    },
  }),
});
