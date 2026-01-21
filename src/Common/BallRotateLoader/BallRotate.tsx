const BallRotateLoader = () => {
  return (
    <div className="BallLoader-container">
      <div className="BallLoader-ball">
        <div className="BallLoader-inner">
          <div className="BallLoader-line" />
          <div className="BallLoader-line BallLoader-line--two" />
          <div className="BallLoader-oval" />
          <div className="BallLoader-oval BallLoader-oval--two" />
        </div>
      </div>
      <div className="BallLoader-shadow" />
    </div>
  );
};

export default BallRotateLoader;