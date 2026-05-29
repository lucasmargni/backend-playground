type User = {
  id: string;
  username: string;
  email?: string;
  posts: string[];
};

type Post = {
  id: string;
  text: string;
  tags: string[];
  user: string;
  comments: string[];
};

type Comment = {
  id: string;
  text: string;
  likes: number;
  dislikes: number;
  user: string;
  post: string;
};

const users: User[] = [
  { id: "u1", username: "lucas123", posts: ["p1", "p2"] },
  { id: "u2", username: "agus_19", posts: ["p3"] },
];

const posts: Post[] = [
  {
    id: "p1",
    text: "miren este cubo de rubik!",
    tags: ["rubikcube"],
    user: "u1",
    comments: [],
  },
  { id: "p2", text: "estoy muy feliz", tags: [], user: "u1", comments: ["c1"] },
  {
    id: "p3",
    text: "ayer fui al everest",
    tags: ["everest", "risk"],
    user: "u2",
    comments: ["c2"],
  },
];

const comments: Comment[] = [
  {
    id: "c1",
    text: "comparte esa felicidad!",
    likes: 0,
    dislikes: 0,
    user: "u2",
    post: "p2",
  },
  { id: "c2", text: "wow", likes: 1, dislikes: 0, user: "u1", post: "p3" },
];

export const resolvers = {
  Query: {
    posts: () => posts,
    postById: (_: any, args: any) => posts.find((p) => p.id === args.id),
    userById: (_: any, args: any) => users.find((u) => u.id === args.id),
    userByUsername: (_: any, args: any) =>
      users.find((u) => u.username === args.username),
  },
  Mutation: {
    addUser: (_: any, args: any) => {
      const newUser = {
        id: `u${String(users.length + 1)}`,
        username: args.username,
        email: args.email,
        posts: [],
      };
      users.push(newUser);
      return newUser;
    },
    addPost: (_: any, args: any) => {
      const newPost = {
        id: `p${String(posts.length + 1)}`,
        text: args.text,
        tags: args.tags,
        user: args.userId,
        comments: [],
      };
      posts.push(newPost);
      const user = users.find((u) => u.id === args.userId);
      user?.posts.push(newPost.id);
      return newPost;
    },
    addComment: (_: any, args: any) => {
      const newComment = {
        id: `c${String(comments.length + 1)}`,
        text: args.text,
        likes: 0,
        dislikes: 0,
        user: args.userId,
        post: args.postId,
      };
      comments.push(newComment);
      const post = posts.find((p) => p.id === args.postId);
      post?.comments.push(newComment.id);
      return newComment;
    },
    likeComment: (_: any, args: any) => {
      const comment = comments.find((c) => c.id === args.commentId);
      comment!.likes++;
      return comment;
    },
    dislikeComment: (_: any, args: any) => {
      const comment = comments.find((c) => c.id === args.commentId);
      comment!.dislikes++;
      return comment;
    },
  },
  User: {
    posts: (parent: any) =>
      parent.posts.map((pid: any) => posts.find((p) => p.id === pid)),
  },
  Post: {
    user: (parent: any) => users.find((u) => u.id === parent.user),
    comments: (parent: any) =>
      parent.comments.map((cid: any) => comments.find((c) => c.id === cid)),
  },
  Comment: {
    user: (parent: any) => users.find((u) => u.id === parent.user),
    post: (parent: any) => posts.find((p) => p.id === parent.post),
  },
};
