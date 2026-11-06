import { useCallback, useEffect, useState } from 'react';
import Alert from '../components/Alert';
import CoverArt from '../components/CoverArt';
import Loader from '../components/Loader';
import { fetchBooks, fetchMovies } from '../services/contentService';
import {
  fetchAdminGenres,
  createAdminContent,
  updateAdminContent,
  deleteAdminContent,
  fetchAdminImage,
} from '../services/adminService';
import { getErrorMessage } from '../services/api';

const emptyForm = {
  title: '', creator: '', description: '', genreId: '', rating: '0',
  year: new Date().getFullYear(), image: '',
};

export default function AdminDashboard() {
  const [type, setType] = useState('book');
  const [items, setItems] = useState([]);
  const [genres, setGenres] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [fetchingImage, setFetchingImage] = useState(false);
const [imageMessage, setImageMessage] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [content, genreRows] = await Promise.all([
        type === 'book' ? fetchBooks({ limit: 100, sort: 'title' }) : fetchMovies({ limit: 100, sort: 'title' }),
        fetchAdminGenres(),
      ]);
      setItems(content);
      setGenres(genreRows);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { loadData(); }, [loadData]);

  const resetForm = () => {
    setForm({ ...emptyForm, genreId: genres[0]?.genre_id || '' });
    setEditingId(null);
  };

  const changeType = (nextType) => {
    setType(nextType);
    setNotice('');
    setError('');
    resetForm();
  };

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleFetchImage = async () => {
  if (!form.title.trim()) {
    setImageMessage('Please enter a title first.');
    return;
  }

  setFetchingImage(true);
  setImageMessage('');

  try {
    const result = await fetchAdminImage(
      type,
      form.title,
      form.creator,
      form.year
    );

    setForm((current) => ({
      ...current,
      image: result.imageUrl,
    }));

    setImageMessage(`Image found using ${result.source}!`);
  } catch (err) {
    setImageMessage(getErrorMessage(err));
  } finally {
    setFetchingImage(false);
  }
};

  const startEdit = (item) => {
    setEditingId(type === 'book' ? item.book_id : item.movie_id);
    setForm({
      title: item.title || '',
      creator: type === 'book' ? item.author : item.director,
      description: item.description || '',
      genreId: String(item.genre_id),
      rating: String(item.rating),
      year: type === 'book' ? item.published_year : item.release_year,
      image: type === 'book' ? item.cover_image || '' : item.poster_image || '',
    });
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    const values = {
      ...form,
      genreId: Number(form.genreId),
      rating: Number(form.rating),
      year: Number(form.year),
    };
    try {
      if (editingId) {
        await updateAdminContent(type, editingId, values);
        setNotice(`${type === 'book' ? 'Book' : 'Movie'} updated successfully.`);
      } else {
        await createAdminContent(type, values);
        setNotice(`${type === 'book' ? 'Book' : 'Movie'} added successfully.`);
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const id = type === 'book' ? item.book_id : item.movie_id;
    if (!window.confirm(`Delete "${item.title}"? Any favourites for this item will also be removed.`)) return;
    setError('');
    setNotice('');
    try {
      await deleteAdminContent(type, id);
      setNotice(`${type === 'book' ? 'Book' : 'Movie'} deleted successfully.`);
      if (editingId === id) resetForm();
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const creatorLabel = type === 'book' ? 'Author' : 'Director';
  const yearLabel = type === 'book' ? 'Published year' : 'Release year';
  const imageLabel = type === 'book' ? 'Cover image URL' : 'Poster image URL';

  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">MoodMatch administration</p>
        <h1>Admin Dashboard</h1>
        <p className="muted">Manage the books and movies available in the recommendation catalogue.</p>

        <div className="admin-tabs" role="group" aria-label="Choose catalogue type">
          <button className={`btn ${type === 'book' ? 'btn--primary' : 'btn--ghost'}`} onClick={() => changeType('book')} type="button">Manage Books</button>
          <button className={`btn ${type === 'movie' ? 'btn--primary' : 'btn--ghost'}`} onClick={() => changeType('movie')} type="button">Manage Movies</button>
        </div>

        <Alert type="error">{error}</Alert>
        <Alert type="success">{notice}</Alert>

        <div className="admin-layout">
          <form className="card-form admin-form" onSubmit={handleSubmit}>
            <h2>{editingId ? 'Update' : 'Add'} {type === 'book' ? 'Book' : 'Movie'}</h2>
            <div className="field">
              <label htmlFor="admin-title">Title</label>
              <input id="admin-title" name="title" value={form.title} onChange={handleChange} required maxLength="200" />
            </div>
            <div className="field">
              <label htmlFor="admin-creator">{creatorLabel}</label>
              <input id="admin-creator" name="creator" value={form.creator} onChange={handleChange} required maxLength="150" />
            </div>
            <div className="field">
              <label htmlFor="admin-description">Description</label>
              <textarea id="admin-description" name="description" value={form.description} onChange={handleChange} required rows="4" />
            </div>
            <div className="field">
              <label htmlFor="admin-genre">Genre</label>
              <select id="admin-genre" name="genreId" value={form.genreId} onChange={handleChange} required>
                <option value="">Select genre</option>
                {genres.map((genre) => <option key={genre.genre_id} value={genre.genre_id}>{genre.genre_name}</option>)}
              </select>
            </div>
            <div className="admin-form-row">
              <div className="field">
                <label htmlFor="admin-rating">Rating (0–{type === 'book' ? '5' : '10'})</label>
                <input id="admin-rating" name="rating" type="number" min="0" max={type === 'book' ? '5' : '10'} step="0.1" value={form.rating} onChange={handleChange} required />
              </div>
              <div className="field">
                <label htmlFor="admin-year">{yearLabel}</label>
                <input id="admin-year" name="year" type="number" min="1000" max="2100" value={form.year} onChange={handleChange} required />
              </div>
            </div>
            <div className="field">
  <label htmlFor="admin-image">{imageLabel} (optional)</label>

  <input
    id="admin-image"
    name="image"
    type="url"
    value={form.image}
    onChange={handleChange}
    placeholder="https://..."
  />

  <button
    type="button"
    className="btn btn--ghost"
    onClick={handleFetchImage}
    disabled={fetchingImage || !form.title.trim()}
  >
    {fetchingImage
      ? 'Fetching Image...'
      : type === 'book'
        ? 'Fetch Book Cover'
        : 'Fetch Movie Poster'}
  </button>

  {imageMessage && <p className="muted">{imageMessage}</p>}

  {form.image && (
    <div style={{ maxWidth: '130px', marginTop: '12px' }}>
      <CoverArt
        src={form.image}
        title={form.title || 'Image Preview'}
        type={type}
      />
    </div>
  )}
</div>
            <div className="admin-form-actions">
              <button className="btn btn--primary" type="submit" disabled={saving || genres.length === 0}>
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add to Catalogue'}
              </button>
              {editingId && <button className="btn btn--ghost" type="button" onClick={resetForm}>Cancel Edit</button>}
            </div>
          </form>

          <div className="admin-list">
            <h2>{type === 'book' ? 'Books' : 'Movies'} ({items.length})</h2>
            {loading ? <Loader label="Loading catalogue..." /> : items.length === 0 ? (
              <p className="muted">No items found.</p>
            ) : (
              <div className="admin-items">
                {items.map((item) => {
                  const id = type === 'book' ? item.book_id : item.movie_id;
                  const image = type === 'book' ? item.cover_image : item.poster_image;
                  return (
                    <article className="admin-item" key={id}>
                      <div className="admin-item__cover"><CoverArt src={image} title={item.title} type={type} /></div>
                      <div className="admin-item__info">
                        <strong>{item.title}</strong>
                        <span>{type === 'book' ? item.author : item.director}</span>
                        <small>{item.genre} · {item.rating}/ {type === 'book' ? 5 : 10}</small>
                        <div className="admin-item__actions">
                          <button type="button" className="btn btn--ghost btn--small" onClick={() => startEdit(item)}>Edit</button>
                          <button type="button" className="btn btn--danger btn--small" onClick={() => handleDelete(item)}>Delete</button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
