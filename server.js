var express = require('express');
var graphqlHTTP = require('express-graphql');
var { makeExecutableSchema } = require('graphql-tools');

var posts = require('./mockdata/posts.json');
var users = require('./mockdata/users.json');

var typeDefs = [`
  type User {
    id: ID
    forename: String
    surname: String
    lastSeen: String
    posts: [Post]
    # Get the last n followers, if not specified the default is 2
    followers(last: Int): [User]
  }

  type Post {
    id: ID
    title: String
    content: String
  }

  type Query {
    # First thing first: start with Hello World of course
    hello: String
    # Get users
    users: [User]
    # Get users by ID
    user(id: ID!): User
    # Get posts
    posts: [Post]
    # Get posts by User ID
    postsByUserId(userId: ID!): [Post]
  }
  
  schema {
    query: Query
  }
`];

var resolvers = {
  Query: {
    hello: () => 'Hello World',
    users: () => users,
    user: (_, { id }) => users.find(u => u.id === id),
    posts: () => posts,
    postsByUserId: (_, { userId }) => posts.filter(p => p.userId === userId)
  },
  User: {
    id: user => user.id,
    forename: user => user.forename,
    surname: user => user.surname,
    lastSeen: user => user.lastSeen,
    posts: user => posts.filter(post => post.userId === user.id),
    followers: (user, { last }) => {
      if (!last) {
        last = 2;
      }
      var followerIds = user.followerIds;
      var lastFollowerIds = followerIds.slice(Math.max(followerIds.length - last, 1));
      return users.filter(u => lastFollowerIds.includes(u.id));
    }
  }
};

var executableSchema = makeExecutableSchema({ typeDefs, resolvers });

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: executableSchema,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');

