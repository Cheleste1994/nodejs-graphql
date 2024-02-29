import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  graphql,
} from 'graphql';
import { PrismaClient, Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library.js';
import { UUIDType } from './types/uuid.js';
import { UserType } from './types/user.js';
import { MemberTypeIdScalar, MemberTypes } from './types/memberTypes.js';
import { PostsTypes } from './types/posts.js';
import { ProfileTypes } from './types/profiles.js';

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    users: {
      type: new GraphQLList(UserType),
      resolve: async (_root, _, { prisma }) => prisma.user.findMany(),
    },
    memberTypes: {
      type: new GraphQLList(MemberTypes),
      resolve: async (_root, _, { prisma }) => prisma.memberType.findMany(),
    },
    posts: {
      type: new GraphQLList(PostsTypes),
      resolve: async (_root, _, { prisma }) => prisma.post.findMany(),
    },
    profiles: {
      type: new GraphQLList(ProfileTypes),
      resolve: async (_root, _, { prisma }) => prisma.profile.findMany(),
    },
    user: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_root, { id }, { prisma, httpErrors }) => {
        const user = await prisma.user.findUnique({ where: { id } });
        return user;
      },
    },

    post: {
      type: PostsTypes,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_root, { id }, { prisma, httpErrors }) => {
        const post = await prisma.post.findUnique({ where: { id } });
        return post;
      },
    },
    profile: {
      type: ProfileTypes,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_root, { id }, { prisma, httpErrors }) => {
        const post = await prisma.profile.findUnique({ where: { id } });
        return post;
      },
    },
    memberType: {
      type: MemberTypes,
      args: {
        id: { type: new GraphQLNonNull(MemberTypeIdScalar) },
      },
      resolve: async (_root, { id }, { prisma, httpErrors }) => {
        const memberType = await prisma.memberType.findUnique({
          where: {
            id,
          },
        });
        return memberType;
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createUser: {
      type: UserType,
      args: {
        name: { type: GraphQLString },
        balance: { type: GraphQLInt },
      },
      resolve: async (
        _root,
        args,
        {
          prisma,
        }: { prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs> },
      ) => {
        const user = await prisma.user.create({
          data: args,
        });
        return user;
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma, httpErrors } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;
      const result = await graphql({
        schema,
        source: query,
        variableValues: variables,
        contextValue: { prisma, httpErrors, req },
      });
      return result;
    },
  });
};

export default plugin;
