import React, { useState } from 'react';
import { useContacts } from '../context/ContactContext';
import { Card, Button, Input, Badge, cn } from '../components/ui';
import { UserPlus, Search, Phone, Mail, Building, ChevronLeft, Trash2, Edit2, Plus, MapPin } from 'lucide-react';
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

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredContacts = contacts.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.address || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      console.log('[Contacts] addContact called:', newName, newEmail);
      await addContact({
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
      console.log('[Contacts] contact saved successfully');
    } catch (err) {
      console.error('[Contacts] addContact error:', err);
      setError(err.message || 'Erreur lors de la sauvegarde.');
    }
    setSaving(false);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl animate-in pb-24">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-10 group w-fit">
        <Link to="/" className="flex items-center gap-2 group-hover:text-primary transition-colors">
          <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all">
            <ChevronLeft size={14} />
          </div>
          Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 px-2">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-4">Annuaire des Partenaires</h1>
          <p className="text-xl text-slate-400 font-medium max-w-xl leading-relaxed">
            Conservez les coordonnées stratégiques de vos clients et collaborateurs externes.
          </p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className={cn(
          "gap-3 h-14 px-8 font-black rounded-2xl transition-all",
          isAdding ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "gradient-primary border-none shadow-xl shadow-primary/20"
        )}>
          {isAdding ? "Annuler" : <><UserPlus size={24} /> Nouveau Contact</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="p-10 mb-16 border-none shadow-2xl bg-white scale-in">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-3">
                ⚠️ {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nom complet</label>
                <Input placeholder="Jean Dupont" value={newName} onChange={e => setNewName(e.target.value)} required className="h-14 font-black" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Entreprise / Agence</label>
                <Input placeholder="Acme Corp" value={newCompany} onChange={e => setNewCompany(e.target.value)} required className="h-14 font-black" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email professionnel</label>
                <Input type="email" placeholder="jean@acme.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} required className="h-14 font-black" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Téléphone</label>
                <Input placeholder="06 12 34 56 78" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="h-14 font-black" />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1 space-y-3 w-full">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Adresse de facturation / Bureau</label>
                <Input placeholder="123 Rue de la Paix, 75000 Paris" value={newAddress} onChange={e => setNewAddress(e.target.value)} className="h-14 font-black" />
              </div>
              <Button type="submit" disabled={saving} className="h-14 px-12 font-black gradient-primary border-none shadow-lg w-full md:w-auto disabled:opacity-70">
                {saving ? 'Enregistrement…' : 'Créer le contact'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="relative mb-12 scale-in">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
        <Input 
          placeholder="Rechercher par nom, entreprise, email..." 
          className="pl-12 h-16 font-black text-lg shadow-2xl shadow-indigo-500/5 bg-white border-none rounded-2xl ring-1 ring-black/5 focus:ring-primary/40 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredContacts.length === 0 ? (
          <div className="col-span-full text-center py-32 bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-white rounded-full shadow-xl flex items-center justify-center mx-auto mb-6 text-slate-200">
               <Building size={32} />
            </div>
            <p className="text-xl font-black text-slate-400">Aucun contact dans cette vue.</p>
          </div>
        ) : (
          filteredContacts.map((contact, idx) => (
            <Card key={contact.id} className="p-8 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group border-none bg-white rounded-[2.5rem] ring-1 ring-black/5 scale-in" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 gradient-primary text-white rounded-[1.25rem] flex items-center justify-center font-black text-2xl shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
                  {contact.name.charAt(0)}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  onClick={() => deleteContact(contact.id)}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">{contact.name}</h3>
              <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.1em] mb-8 bg-primary/5 w-fit px-3 py-1 rounded-full">
                <Building size={12} />
                {contact.company}
              </div>

              <div className="space-y-4 pt-8 border-t border-slate-50">
                <div className="flex items-center gap-4 text-sm font-bold text-slate-600 group-hover:text-primary transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shadow-inner"><Mail size={14} className="text-slate-400 shrink-0" /></div>
                  <a href={`mailto:${contact.email}`} className="truncate">{contact.email}</a>
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shadow-inner"><Phone size={14} className="text-slate-400 shrink-0" /></div>
                    <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                  </div>
                )}
                {contact.address && (
                  <div className="flex items-start gap-4 text-sm font-bold text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shadow-inner mt-0.5"><MapPin size={14} className="text-slate-400 shrink-0" /></div>
                    <span className="leading-tight pt-1">{contact.address}</span>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Contacts;
