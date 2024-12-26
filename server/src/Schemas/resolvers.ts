import { User } from "../models/User";
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
      const token = signToken(user);
      return { token, user };
    },
    addUser: async (_parent: any, { username, email, password }: any) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (_parent: any, { input }: any, context: any) => {
      if (context.user) {
        return User.findByIdAndUpdate(
          context.user._id,
          { $push: { savedBooks: input } },
          { new: true, runValidators: true },
        );
      }
      throw new AuthenticationError("Not logged in");
    },
    removeBook: async (_parent: any, { bookId }: any, context: any) => {
      if (context.user) {
        return User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedBooks: { bookId } } },
          { new: true },
        );
      }
      throw new AuthenticationError("Not logged in");
    },
  },
};
