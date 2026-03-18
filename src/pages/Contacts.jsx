import React, { useState } from 'react';
import { useContacts } from '../context/ContactContext';
import { Card, Button, Input, cn } from '../components/ui';
import { UserPlus, Search, Phone, Mail, Building, ChevronLeft, Trash2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Contacts = () => {
  const { contacts, addContact, deleteContact } = useContacts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const filteredContacts = contacts.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.address || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    addContact({
      name: newName,
      company: newCompany,
      email: newEmail,
      phone: newPhone,
      address: newAddress
    });
    setNewName('');
    setNewCompany('');
    setNewEmail('');
    setNewPhone('');
    setNewAddress('');
    setIsAdding(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-in pb-24">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-10 group w-fit">
        <Link to="/" className="flex items-center gap-2 group-hover:text-primary transition-colors">
          <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all"><ChevronLeft size={14} /></div>
          Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 px-2">
        <div>
           <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-4">Mes Contacts</h1>
           <p className="text-xl text-slate-400 font-medium italic">Accès rapide pour l'assignation de projets</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="gap-3 h-14 px-8 font-black rounded-2xl bg-slate-900 border-none shadow-xl text-white hover:bg-slate-800">
             <UserPlus size={24} /> Nouveau Contact
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="p-10 mb-16 border-none shadow-2xl bg-white scale-in">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nom complet</label>
                <Input placeholder="Jean Dupont" value={newName} onChange={e => setNewName(e.target.value)} required className="h-14 font-black" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Entreprise</label>
                <Input placeholder="Acme Corp" value={newCompany} onChange={e => setNewCompany(e.target.value)} required className="h-14 font-black" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email</label>
                <Input type="email" placeholder="jean@acme.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} required className="h-14 font-black" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Téléphone</label>
                <Input placeholder="06 12 34 56 78" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="h-14 font-black" />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1 space-y-3 w-full">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Adresse</label>
                <Input placeholder="123 Rue de la Paix" value={newAddress} onChange={e => setNewAddress(e.target.value)} className="h-14 font-black" />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                 <Button type="submit" className="h-14 px-12 font-black gradient-primary border-none shadow-lg rounded-xl flex-1 md:flex-none">Ajouter</Button>
                 <Button variant="ghost" onClick={() => setIsAdding(false)} className="h-14 font-bold border-none rounded-xl">Annuler</Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      <div className="relative mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <Input placeholder="Rechercher…" className="pl-12 h-16 font-black text-lg bg-white shadow-sm border-none rounded-2xl ring-1 ring-black/5 focus:ring-primary/40 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredContacts.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 font-black">Aucun contact trouvé.</div>
        ) : (
          filteredContacts.map((contact) => (
            <Card key={contact.id} className="p-8 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group border-none bg-white rounded-[2.5rem] ring-1 ring-black/5 scale-in">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 gradient-primary text-white rounded-[1.25rem] flex items-center justify-center font-black text-2xl shadow-lg">{ (contact.name || 'U').charAt(0) }</div>
                <Button variant="ghost" size="icon" onClick={() => deleteContact(contact.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={18} /></Button>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">{contact.name}</h3>
              <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase mb-8 bg-primary/5 w-fit px-3 py-1 rounded-full"><Building size={12} /> {contact.company}</div>
              <div className="space-y-4 pt-8 border-t border-slate-50 text-sm font-bold text-slate-600">
                <div className="flex items-center gap-3"><Mail size={14} className="text-slate-400" /> <a href={`mailto:${contact.email}`} className="truncate">{contact.email}</a></div>
                {contact.phone && <div className="flex items-center gap-3"><Phone size={14} className="text-slate-400" /> <a href={`tel:${contact.phone}`}>{contact.phone}</a></div>}
                {contact.address && <div className="flex items-start gap-3"><MapPin size={14} className="text-slate-400" /> <span className="leading-tight">{contact.address}</span></div>}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Contacts;
