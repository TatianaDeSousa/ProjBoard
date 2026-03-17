import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ContactContext = createContext();

export const useContacts = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContacts must be used within a ContactProvider');
  }
  return context;
};

export const ContactProvider = ({ children }) => {
  const { currentUser } = useAuth();
  
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('projboard_contacts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('projboard_contacts', JSON.stringify(contacts));
  }, [contacts]);

  const visibleContacts = contacts.filter(c => c.ownerId === currentUser?.id);

  const addContact = (contactData) => {
    if (!currentUser) return;
    const newContact = {
      id: crypto.randomUUID(),
      ownerId: currentUser.id,
      ...contactData,
      createdAt: new Date().toISOString()
    };
    setContacts(prev => [newContact, ...prev]);
    return newContact;
  };

  const updateContact = (id, updates) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteContact = (id) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  return (
    <ContactContext.Provider value={{
      contacts: visibleContacts,
      addContact,
      updateContact,
      deleteContact
    }}>
      {children}
    </ContactContext.Provider>
  );
};
