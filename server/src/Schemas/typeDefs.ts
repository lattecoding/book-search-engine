export const typeDefs = `
  type Query {
    me: User
  }

  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(input: BookInput!): User
    removeBook(bookId: String!): User
  }

  type User {
    _id: ID!
    username: String!
    email: String!
    bookCount: Int
    savedBooks: [String]
  }

  input BookInput {
    bookId: String!
  }

  type Auth {
    token: String!
    user: User!
  }
`;
