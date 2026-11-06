// Small star badge. Books are rated out of 5, movies out of 10.
export default function Rating({ value, max }) {
  return (
    <span className="rating" title={`Rated ${Number(value).toFixed(1)} out of ${max}`}>
      ★ {Number(value).toFixed(1)}
      <small>/{max}</small>
    </span>
  );
}
