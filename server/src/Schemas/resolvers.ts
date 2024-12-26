import { User } from "../models/User";
import { signToken } from "../services/auth";
import { AuthenticationError } from "apollo-server-express";

const resolvers = {
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

      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    addUser: async (
      _parent: any,
      {
        username,
        email,
        password,
      }: { username: string; email: string; password: string },
    ) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    saveBook: async (
      _parent: any,
      { bookData }: { bookData: any },
      context: any,
    ) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $addToSet: { savedBooks: bookData } },
          { new: true },
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

export default resolvers;
