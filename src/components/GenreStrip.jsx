const GENRES = ['FANTASY', 'ROMANCE', 'THRILLER', 'SCI-FI', 'DRAMA', 'REVENGE', 'HORROR', 'POETRY', 'HISTORICAL', 'MYSTERY', 'FICTION', 'FLASH FICTION', 'LITERARY', 'DARK', 'SURREAL']

export default function GenreStrip() {
  return (
    <section id="genre-section" className="genre-section">
      <div className="genre-marquee-wrap">
        <div className="genre-marquee">
          {[...GENRES, ...GENRES].map((g, i) => (
            <span key={i} className="genre-pill">{g}</span>
          ))}
        </div>
      </div>
    </section>
  )
}