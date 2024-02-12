export const getSenderName = (loggedUser, users) => {
  if (!loggedUser || !users || users.length < 2) {
    // Handle the case where users array or loggedUser is not as expected
    return "Unknown User";
  }

  return users[0]._id === loggedUser._id
    ? users[1].username
    : users[0].username;
};

export const getFullSender = (loggedUser, users) => {
  if (!loggedUser || !users || users.length < 2) {
    // Handle the case where users array or loggedUser is not as expected
    return "Unknown User";
  }

  return users[0]._id === loggedUser._id ? users[1] : users[0].username;
};

// Check if the message is the last message in the chat
export const isSameSender = (messages, msg, i, userId) => {
  return (
    i < messages.length - 1 && // Check if the message is not the last message
    (messages[i + 1].sender._id !== msg.sender._id || // Check if the next message is from the same sender
      messages[i + 1].sender._id === undefined) && // Check if the next message is from the same sender
    messages[i].sender._id !== userId // Check if the message is from the logged in user
  );
};

// Check if the message is the last message in the chat opposed user
export const isLastMessage = (messages, i, userId) => {
  return (
    // Check if the message is the last message in the chat
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId && // Check if the message is from the logged in user
    messages[messages.length - 1].sender._id // Check if the message is from the logged in user
  );
};

export const isSameUser = (messages, msg, i) => {
  return i > 0 && messages[i - 1].sender._id === msg.sender._id;
};

// export const getSender = (loggedUser, users) => {
//   return users[0]?._id === loggedUser?._id
//     ? users[1].username
//     : users[0].username;
// };

// export const getSenderFull = (loggedUser, users) => {
//   return users[0]._id === loggedUser._id ? users[1] : users[0];
// };

export const isSameSenderMargin = (messages, msg, i, userId) => {
  // console.log(i === messages.length - 1);

  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === msg.sender._id &&
    messages[i].sender._id !== userId
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== msg.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  else return "auto";
};
