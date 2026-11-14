/** The hotel site's nav bar (same markup and classes), with Digital Twin Lab as the active page. */
export function SiteNav() {
  return (
    <nav>
      <div className="row">
        <a className="tw-logo-link" href="/" aria-label="Omnifood home">
          <img className="logo" src="/Resources/img/logo.png" alt="Omnifood" />
        </a>
        <ul className="main-nav">
          <li><a href="/">Home</a></li>
          <li><a href="#live">Live</a></li>
          <li><a href="#how">How it works</a></li>
          <li><a className="nav-lab" href="/digital-twin/" aria-current="page">Digital Twin Lab</a></li>
        </ul>
        <a className="btn btn-full nav-lab-mobile" href="/digital-twin/">Digital Twin Lab</a>
      </div>
    </nav>
  );
}
