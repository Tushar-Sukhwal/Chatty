import React from "react";
import ChatAreaMessageEditModal from "./chatAreaMessageEditModal";

type Props = {};

const chatAreaMessage = (props: Props) => {
  //these are the individual messages in the chat area
  //on right click these will show the options to edit, delete,

  const handleMessageEdit = () => {
    // TODO handleMessageEdit
  };

  const handleMessageDelete = () => {
    // TODO handleMessageDelete
  };
  return (
    <div>
      {/* <ChatAreaMessageEditModal
        handleMessageEdit={handleMessageEdit}
        handleMessageDelete={handleMessageDelete}
      /> */}
    </div>
  );
};

export default chatAreaMessage;
