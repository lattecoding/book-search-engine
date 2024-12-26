import { User } from "../models/User";
import { AuthenticationError } from "apollo-server-express";
import { signToken } from "../utils/auth";

export const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: any) => {
      if (context.user) {
        return User.findById(context.user._id);
      }
      throw new AuthenticationError("Not logged in");
    },
  },
  Mutation: {
    login: async (
      _parent: any,
      { email, password }: { email: string; password: string },
    ) => {
      const user = await User.findOne({ email });
      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError("Incorrect credentials");
      }
      const token = signToken(user.username, user.email, user._id.toString());
      return { token, user };
    },
    addUser: async (_parent: any, { username, email, password }: any) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user.username, user.email, user._id.toString());
      return { token, user };
    },
    saveBook: async (_parent: any, { input }: { input: any }, context: any) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $push: { savedBooks: input } },
          { new: true, runValidators: true },
        );
        return updatedUser;
      }
      throw new AuthenticationError("Not logged in");
    },
    removeBook: async (
      _parent: any,
      { bookId }: { bookId: string },
      context: any,
    ) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedBooks: { bookId } } },
          { new: true },
        );
        return updatedUser;
      }
      throw new AuthenticationError("Not logged in");
    },
  },
};
