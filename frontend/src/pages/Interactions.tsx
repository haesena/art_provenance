import React, { useEffect, useState } from 'react';
import { 
  getInteractions, createInteraction, updateInteraction, deleteInteraction, 
  getPersonLookup, getInstitutionLookup, getSourceLookup, Interaction, LookupItem 
} from '../services/api';
import { 
  Plus, Search, Trash2, Edit, X, ArrowLeftRight, User, Landmark, 
  Check, ChevronDown, Calendar, MapPin, AlertCircle, Filter, Sparkles, Clock, Zap 
} from 'lucide-react';

const SearchableSelect: React.FC<{
  label: string;
  items: LookupItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  placeholder: string;
  error?: boolean;
}> = ({ label, items, selectedId, onSelect, placeholder, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedItem = items.find(item => item.id === selectedId);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.place && item.place.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative space-y-1.5 flex-1 min-w-[200px]">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-white border rounded-lg px-3 py-2 text-left text-sm flex items-center justify-between shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${error ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-300'}`}
        >
          <span className={selectedItem ? 'text-slate-900 font-medium truncate' : 'text-slate-400'}>
            {selectedItem ? selectedItem.name : placeholder}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
        </button>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
            <div className="p-2 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto py-1 text-sm">
              {filteredItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${item.id === selectedId ? 'bg-indigo-50/50 text-indigo-700 font-medium' : 'text-slate-700'}`}
                >
                  <div className="min-w-0 pr-4">
                    <div className="truncate font-medium">{item.name}</div>
                    {item.place && <div className="text-[10px] text-slate-400 truncate">{item.place}</div>}
                  </div>
                  {item.id === selectedId && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                </button>
              ))}
              {filteredItems.length === 0 && (
                <div className="px-3 py-3 text-center text-xs text-slate-400 italic">No matches found</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Interactions: React.FC = () => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [persons, setPersons] = useState<LookupItem[]>([]);
  const [institutions, setInstitutions] = useState<LookupItem[]>([]);
  const [sourcesLookup, setSourcesLookup] = useState<LookupItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Form State
  const [entity1Type, setEntity1Type] = useState<'person' | 'institution'>('person');
  const [entity1Id, setEntity1Id] = useState<number | null>(null);
  const [entity2Type, setEntity2Type] = useState<'person' | 'institution'>('person');
  const [entity2Id, setEntity2Id] = useState<number | null>(null);
  const [interactionType, setInteractionType] = useState<'long term' | 'singular'>('long term');
  const [date, setDate] = useState('');
  const [place, setPlace] = useState('');
  const [notes, setNotes] = useState('');
  
  // Dynamic sources row state
  const [formSources, setFormSources] = useState<{ id: string; sourceId: number | null; notes: string }[]>([]);
  
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [interactionsRes, personsRes, institutionsRes, sourcesRes] = await Promise.all([
        getInteractions(),
        getPersonLookup(),
        getInstitutionLookup(),
        getSourceLookup()
      ]);
      setInteractions(interactionsRes.results || []);
      setPersons(personsRes.results || []);
      setInstitutions(institutionsRes.results || []);
      setSourcesLookup(sourcesRes.results || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
      setApiError('Unable to load interactions. Please try reloading.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedId(null);
    setEntity1Type('person');
    setEntity1Id(null);
    setEntity2Type('person');
    setEntity2Id(null);
    setInteractionType('long term');
    setDate('');
    setPlace('');
    setNotes('');
    setFormSources([]);
    setFormErrors({});
    setApiError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (interaction: Interaction) => {
    setModalMode('edit');
    setSelectedId(interaction.id);
    setEntity1Type(interaction.entity1.type);
    setEntity1Id(interaction.entity1.id);
    setEntity2Type(interaction.entity2.type);
    setEntity2Id(interaction.entity2.id);
    setInteractionType(interaction.interaction_type);
    setDate(interaction.date);
    setPlace(interaction.place);
    setNotes(interaction.notes || '');
    setFormSources(
      interaction.sources.map(s => ({
        id: Math.random().toString(),
        sourceId: s.source_id,
        notes: s.notes || ''
      }))
    );
    setFormErrors({});
    setApiError(null);
    setIsModalOpen(true);
  };

  const addSourceRow = () => {
    setFormSources([...formSources, { id: Math.random().toString(), sourceId: null, notes: '' }]);
  };

  const removeSourceRow = (id: string) => {
    setFormSources(formSources.filter(s => s.id !== id));
  };

  const updateSourceRow = (id: string, field: 'sourceId' | 'notes', value: any) => {
    setFormSources(
      formSources.map(s => s.id === id ? { ...s, [field]: value } : s)
    );
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!entity1Id) errors.entity1Id = 'Please select Entity 1';
    if (!entity2Id) errors.entity2Id = 'Please select Entity 2';
    if (entity1Type === entity2Type && entity1Id === entity2Id && entity1Id !== null) {
      errors.entity2Id = 'An entity cannot interact with itself';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      entity1_type: entity1Type,
      entity1_id: entity1Id!,
      entity2_type: entity2Type,
      entity2_id: entity2Id!,
      interaction_type: interactionType,
      date,
      place,
      notes,
      sources: formSources
        .filter(s => s.sourceId !== null)
        .map(s => ({
          source_id: s.sourceId!,
          notes: s.notes
        }))
    };

    try {
      if (modalMode === 'create') {
        await createInteraction(payload);
        showToast('Interaction created successfully');
      } else {
        await updateInteraction(selectedId!, payload);
        showToast('Interaction updated successfully');
      }
      setIsModalOpen(false);
      fetchAllData();
    } catch (error: any) {
      console.error('Error saving interaction', error);
      const resError = error.response?.data?.error;
      setApiError(typeof resError === 'string' ? resError : 'An error occurred while saving.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this interaction?')) return;
    try {
      await deleteInteraction(id);
      showToast('Interaction deleted successfully');
      fetchAllData();
    } catch (error) {
      console.error('Failed to delete interaction', error);
      alert('Failed to delete interaction.');
    }
  };

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const filteredInteractions = interactions.filter(interaction => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      interaction.entity1.name.toLowerCase().includes(term) ||
      interaction.entity2.name.toLowerCase().includes(term) ||
      interaction.place.toLowerCase().includes(term) ||
      interaction.date.toLowerCase().includes(term) ||
      interaction.notes.toLowerCase().includes(term);

    const matchesType = typeFilter === '' || interaction.interaction_type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successMsg && (
        <div className="fixed bottom-5 right-5 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <Sparkles className="w-5 h-5 text-emerald-100" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-indigo-600" />
            Interactions Maintenance
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage long-term and singular relationships between persons and institutions.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md transition-all duration-200 active:scale-95 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Interaction
        </button>
      </div>

      {/* Filters section */}
      <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, place, date, notes..."
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type:</span>
          </div>
          <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setTypeFilter('')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${typeFilter === '' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('long term')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${typeFilter === 'long term' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Long Term
            </button>
            <button
              onClick={() => setTypeFilter('singular')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${typeFilter === 'singular' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Singular
            </button>
          </div>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 border-collapse text-left">
              <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3 border-b border-slate-200 w-16">ID</th>
                  <th scope="col" className="px-6 py-3 border-b border-slate-200">Entity 1 (Source)</th>
                  <th scope="col" className="px-6 py-3 border-b border-slate-200 text-center w-16">Type</th>
                  <th scope="col" className="px-6 py-3 border-b border-slate-200">Entity 2 (Target)</th>
                  <th scope="col" className="px-6 py-3 border-b border-slate-200">Date & Place</th>
                  <th scope="col" className="px-6 py-3 border-b border-slate-200">Interaction Notes</th>
                  <th scope="col" className="px-6 py-3 border-b border-slate-200">Sources</th>
                  <th scope="col" className="px-6 py-3 border-b border-slate-200 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 text-sm text-slate-700">
                {filteredInteractions.map((interaction) => (
                  <tr key={interaction.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono text-xs">{interaction.id}</td>
                    
                    {/* Entity 1 */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {interaction.entity1.type === 'person' ? (
                          <User className="w-4 h-4 text-indigo-500 shrink-0" />
                        ) : (
                          <Landmark className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                        <div>
                          <div className="font-semibold text-slate-900">{interaction.entity1.name}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-medium">{interaction.entity1.type}</div>
                        </div>
                      </div>
                    </td>

                    {/* Type / Direction */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {interaction.interaction_type === 'long term' ? (
                        <span title="Long Term Relationship">
                          <Clock className="w-5 h-5 text-indigo-600 mx-auto" />
                        </span>
                      ) : (
                        <span title="Singular Relationship">
                          <Zap className="w-5 h-5 text-amber-500 mx-auto" />
                        </span>
                      )}
                    </td>

                    {/* Entity 2 */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {interaction.entity2.type === 'person' ? (
                          <User className="w-4 h-4 text-indigo-500 shrink-0" />
                        ) : (
                          <Landmark className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                        <div>
                          <div className="font-semibold text-slate-900">{interaction.entity2.name}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-medium">{interaction.entity2.type}</div>
                        </div>
                      </div>
                    </td>

                    {/* Date / Place */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {interaction.date && (
                          <div className="flex items-center gap-1 text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{interaction.date}</span>
                          </div>
                        )}
                        {interaction.place && (
                          <div className="flex items-center gap-1 text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{interaction.place}</span>
                          </div>
                        )}
                        {!interaction.date && !interaction.place && <span className="text-slate-400 italic text-xs">-</span>}
                      </div>
                    </td>

                    {/* Interaction Notes */}
                    <td className="px-6 py-4 max-w-xs text-xs">
                      {interaction.notes ? (
                        <p className="text-slate-600 italic line-clamp-2" title={interaction.notes}>
                          "{interaction.notes}"
                        </p>
                      ) : (
                        <span className="text-slate-400 italic">-</span>
                      )}
                    </td>

                    {/* Sources */}
                    <td className="px-6 py-4 max-w-xs">
                      {interaction.sources && interaction.sources.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {interaction.sources.map((s, idx) => (
                            <span 
                              key={idx} 
                              className="inline-flex items-center text-[10px] px-1.5 py-0.5 bg-indigo-50/60 text-indigo-700 border border-indigo-100 rounded-md font-medium"
                              title={`${s.source_name}${s.notes ? ` — ${s.notes}` : ''}`}
                            >
                              {s.source_name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openEditModal(interaction)}
                          className="p-1.5 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg hover:text-indigo-600 transition-colors shadow-sm"
                          title="Edit Interaction"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(interaction.id)}
                          className="p-1.5 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg hover:text-red-600 transition-colors shadow-sm"
                          title="Delete Interaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredInteractions.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 italic">
              <ArrowLeftRight className="w-12 h-12 text-slate-300 mb-2.5" />
              <p className="text-sm">No interactions found matching your parameters.</p>
            </div>
          )}
        </div>
      )}

      {/* Save Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                {modalMode === 'create' ? 'Create Interaction' : 'Edit Interaction'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-2.5 text-sm">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Entity 1 Configuration */}
              <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">Entity 1 (Source)</h4>
                
                <div className="flex gap-4 items-end flex-wrap">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</label>
                    <div className="flex bg-slate-200/70 rounded-lg p-0.5 border border-slate-300">
                      <button
                        type="button"
                        onClick={() => {
                          setEntity1Type('person');
                          setEntity1Id(null);
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${entity1Type === 'person' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        <User className="w-3.5 h-3.5" />
                        Person
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEntity1Type('institution');
                          setEntity1Id(null);
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${entity1Type === 'institution' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        <Landmark className="w-3.5 h-3.5" />
                        Institution
                      </button>
                    </div>
                  </div>

                  <SearchableSelect
                    label={`Select ${entity1Type}`}
                    items={entity1Type === 'person' ? persons : institutions}
                    selectedId={entity1Id}
                    onSelect={(id) => setEntity1Id(id)}
                    placeholder={`Select matching ${entity1Type}...`}
                    error={!!formErrors.entity1Id}
                  />
                </div>
                {formErrors.entity1Id && (
                  <p className="text-xs font-medium text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {formErrors.entity1Id}
                  </p>
                )}
              </div>

              {/* Entity 2 Configuration */}
              <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700">Entity 2 (Target)</h4>
                
                <div className="flex gap-4 items-end flex-wrap">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</label>
                    <div className="flex bg-slate-200/70 rounded-lg p-0.5 border border-slate-300">
                      <button
                        type="button"
                        onClick={() => {
                          setEntity2Type('person');
                          setEntity2Id(null);
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${entity2Type === 'person' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        <User className="w-3.5 h-3.5" />
                        Person
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEntity2Type('institution');
                          setEntity2Id(null);
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${entity2Type === 'institution' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        <Landmark className="w-3.5 h-3.5" />
                        Institution
                      </button>
                    </div>
                  </div>

                  <SearchableSelect
                    label={`Select ${entity2Type}`}
                    items={entity2Type === 'person' ? persons : institutions}
                    selectedId={entity2Id}
                    onSelect={(id) => setEntity2Id(id)}
                    placeholder={`Select matching ${entity2Type}...`}
                    error={!!formErrors.entity2Id}
                  />
                </div>
                {formErrors.entity2Id && (
                  <p className="text-xs font-medium text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {formErrors.entity2Id}
                  </p>
                )}
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Interaction Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Interaction Type</label>
                  <select
                    value={interactionType}
                    onChange={(e) => setInteractionType(e.target.value as 'long term' | 'singular')}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="long term">Long Term</option>
                    <option value="singular">Singular</option>
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 1944 or 1940-1945"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                {/* Place */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Place</label>
                  <input
                    type="text"
                    placeholder="e.g. Paris, France"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                  />
                </div>

              </div>

              {/* General Notes Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">General Notes</label>
                <textarea
                  placeholder="Type general comments regarding this interaction..."
                  rows={3}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Multiple Sources Subsection */}
              <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Sources</h4>
                  <button
                    type="button"
                    onClick={addSourceRow}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Source Link
                  </button>
                </div>
                
                {formSources.length > 0 ? (
                  <div className="space-y-3">
                    {formSources.map((row) => (
                      <div key={row.id} className="flex gap-3 items-end flex-wrap bg-white p-3 border border-slate-200 rounded-xl relative shadow-sm">
                        <SearchableSelect
                          label="Source"
                          items={sourcesLookup}
                          selectedId={row.sourceId}
                          onSelect={(id) => updateSourceRow(row.id, 'sourceId', id)}
                          placeholder="Select source..."
                        />
                        
                        <div className="space-y-1.5 flex-1 min-w-[200px]">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Source Notes</label>
                          <input
                            type="text"
                            placeholder="e.g. page 45, entry #3"
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                            value={row.notes}
                            onChange={(e) => updateSourceRow(row.id, 'notes', e.target.value)}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeSourceRow(row.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors shrink-0 mb-0.5"
                          title="Remove source link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No sources linked yet. Click "Add Source Link" to start linking sources.</p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm shadow-sm transition-all duration-200 active:scale-95"
                >
                  {modalMode === 'create' ? 'Create' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interactions;
