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

export const users: User[] = [
  { id: "u1", username: "lucas123", posts: ["p1", "p2"] },
  { id: "u2", username: "agus_19", posts: ["p3"] },
];

export const posts: Post[] = [
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

export const comments: Comment[] = [
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
