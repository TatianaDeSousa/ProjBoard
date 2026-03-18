import React, { createContext, useContext, useState, useEffect } from 'react';

const ContactContext = createContext();

export const useContacts = () => useContext(ContactContext);

export const ContactProvider = ({ children }) => {
  const [contacts, setContacts] = useState(() => JSON.parse(localStorage.getItem('pb_contacts')) || []);

  useEffect(() => {
    localStorage.setItem('pb_contacts', JSON.stringify(contacts));
  }, [contacts]);

  const addContact = (contact) => {
    const newContact = { id: crypto.randomUUID(), ...contact };
    setContacts([newContact, ...contacts]);
    return newContact;
  };

  const deleteContact = (contactId) => {
    setContacts(contacts.filter(c => c.id !== contactId));
  };

  const updateContact = (contactId, updates) => {
    setContacts(contacts.map(c => c.id === contactId ? { ...c, ...updates } : c));
  };

  return (
    <ContactContext.Provider value={{ contacts, addContact, deleteContact, updateContact }}>
      {children}
    </ContactContext.Provider>
  );
};
