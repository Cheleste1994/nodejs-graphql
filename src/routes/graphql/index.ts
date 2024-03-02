import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  graphql,
  parse,
  validate,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { ChangeUserInput, CreateUserInput, UserType } from './types/user.js';
import { MemberTypeIdScalar, MemberTypes } from './types/memberTypes.js';
import { ChangePostInput, CreatePostInput, PostsTypes } from './types/posts.js';
import {
  ChangeProfileInput,
  CreateProfileInput,
  ProfileTypes,
} from './types/profiles.js';
import depthLimit from 'graphql-depth-limit';

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
    createPost: {
      type: new GraphQLNonNull(PostsTypes),
      args: {
        dto: { type: new GraphQLNonNull(CreatePostInput) },
      },
      resolve: async (_root, { dto }, { prisma }) => {
        const post = await prisma.post.create({
          data: dto,
        });
        return post;
      },
    },
    changePost: {
      type: PostsTypes,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangePostInput) },
      },
      resolve: async (_root, { dto, id }, { prisma }) => {
        const post = await prisma.post.update({
          where: { id },
          data: dto,
        });
        return post;
      },
    },
    createUser: {
      type: new GraphQLNonNull(UserType),
      args: {
        dto: { type: new GraphQLNonNull(CreateUserInput) },
      },
      resolve: async (_root, { dto }, { prisma }) => {
        const user = await prisma.user.create({
          data: dto,
        });
        return user;
      },
    },
    changeUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInput) },
      },
      resolve: async (_root, { dto, id }, { prisma }) => {
        const user = await prisma.user.update({
          where: { id },
          data: dto,
        });
        return user;
      },
    },
    createProfile: {
      type: new GraphQLNonNull(ProfileTypes),
      args: {
        dto: { type: new GraphQLNonNull(CreateProfileInput) },
      },
      resolve: async (_root, { dto }, { prisma }) => {
        const profile = await prisma.profile.create({
          data: dto,
        });
        return profile;
      },
    },
    changeProfile: {
      type: ProfileTypes,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInput) },
      },
      resolve: async (_root, { dto, id }, { prisma }) => {
        const profile = await prisma.profile.update({
          where: { id },
          data: dto,
        });
        return profile;
      },
    },
    deletePost: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_root, { id }, { prisma }) => {
        await prisma.post.delete({
          where: {
            id,
          },
        });
        return true;
      },
    },
    deleteProfile: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_root, { id }, { prisma }) => {
        await prisma.profile.delete({
          where: {
            id,
          },
        });
        return true;
      },
    },
    deleteUser: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_root, { id }, { prisma }) => {
        await prisma.user.delete({
          where: {
            id,
          },
        });
        return true;
      },
    },
    subscribeTo: {
      type: UserType,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_root, { userId, authorId }, { prisma }) => {
        const user = await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            userSubscribedTo: {
              create: {
                authorId,
              },
            },
          },
        });
        return user;
      },
    },
    unsubscribeFrom: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_root, { userId, authorId }, { prisma }) => {
        await prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: userId,
              authorId: authorId,
            },
          },
        });
        return true;
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

      const arrErrors = validate(schema, parse(query), [depthLimit(5)]);

      if (arrErrors.length) {
        return { errors: arrErrors };
      }

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
