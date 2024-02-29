import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLFloat,
  GraphQLScalarType,
  Kind,
} from 'graphql';
import { MemberTypeId } from '../../member-types/schemas.js';

export const MemberTypeIdScalar = new GraphQLScalarType({
  name: 'MemberTypeId',
  serialize(value: unknown) {
    if (
      typeof value === 'string' &&
      (value === MemberTypeId.BASIC || value === MemberTypeId.BUSINESS)
    ) {
      return value;
    }
    throw new Error('Invalid value');
  },
  parseValue(value) {
    if (
      typeof value === 'string' &&
      (value === MemberTypeId.BASIC || value === MemberTypeId.BUSINESS)
    ) {
      return value;
    }
    throw new Error('Invalid value');
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      if (ast.value === MemberTypeId.BASIC || ast.value === MemberTypeId.BUSINESS) {
        return ast.value;
      }
    }
    return undefined;
  },
});

export const MemberTypes = new GraphQLObjectType({
  name: 'memberType',
  fields: {
    id: { type: MemberTypeIdScalar },
    postsLimitPerMonth: { type: GraphQLInt },
    discount: { type: GraphQLFloat },
  },
});
