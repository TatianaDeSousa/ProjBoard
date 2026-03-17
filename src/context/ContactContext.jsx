import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';

const ContactContext = createContext();

export const useContacts = () => useContext(ContactContext);

export const ContactProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchContacts();
    } else {
      setContacts([]);
      setLoading(false);
    }
  }, [currentUser]);

  const fetchContacts = async () => {
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .order('name');
    
    if (data) setContacts(data);
    setLoading(false);
  };

  const addContact = async (contactData) => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('contacts')
      .insert([{ owner_id: currentUser.id, ...contactData }])
      .select()
      .single();
    
    if (data) fetchContacts();
    return data;
  };

  const updateContact = async (id, updates) => {
    await supabase.from('contacts').update(updates).eq('id', id);
    fetchContacts();
  };

  const deleteContact = async (id) => {
    await supabase.from('contacts').delete().eq('id', id);
    fetchContacts();
  };

  return (
    <ContactContext.Provider value={{
      contacts,
      loading,
      addContact,
      updateContact,
      deleteContact
    }}>
      {children}
    </ContactContext.Provider>
  );
};
