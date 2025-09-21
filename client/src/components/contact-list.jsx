import { useAppStore } from "@/store";

const ContactList = ({ contacts, isChannel = false }) => {
  const {
    selectedChatData,
    setSelectedChatData,
    setSelectedChatType,
    setSelectedChatMessages,
  } = useAppStore();

  const handleClick = (contact) => {
    if (isChannel) setSelectedChatType("channel");
    else setSelectedChatType("contact");

    if (!selectedChatData || selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }

    setSelectedChatData(contact);
  };

  return (
    <div className="mt-5">
      {contacts.map((contact) => (
        <div key={contact._id} onClick={() => handleClick(contact)}>
          {contact._id}
        </div>
      ))}
    </div>
  );
};

export default ContactList;
