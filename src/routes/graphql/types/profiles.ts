import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLInputObjectType,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { MemberTypeIdScalar, MemberTypes } from './memberTypes.js';

export const ProfileTypes = new GraphQLObjectType({
  name: 'Profiles',
  fields: {
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: GraphQLString },
    memberTypeId: { type: MemberTypeIdScalar },
    memberType: {
      type: MemberTypes,
      resolve: async ({ memberTypeId }, _, { prisma }) => {
        const memberType = await prisma.memberType.findUnique({
          where: { id: memberTypeId },
        });

        return memberType;
      },
    },
  },
});

export const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: GraphQLString },
    memberTypeId: { type: MemberTypeIdScalar },
  },
});

export const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: MemberTypeIdScalar },
  },
});
