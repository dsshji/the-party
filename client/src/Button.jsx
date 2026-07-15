export default function Button({ textButton, eventButton, className = '', btnClassName = '' }) {
  return (
    <div className={`btn-wrapper ${className}`.trim()}>
      <div className="light"></div>
      <div
        className="gradient-layer"
        style={{  animationDelay: '0s', animationDuration: '25s'}}
      ></div>
      <div
        className="gradient-layer"
        style={{  animationDelay: '0.15s', animationDuration: '15.9s'}}
      ></div>
      <div
        className="gradient-layer"
        style={{  animationDelay: '0.53s', animationDuration: '26.4s'}}
      ></div>
      <div
        className="gradient-layer"
        style={{  animationDelay: '0.45s', animationDuration: '17.8s'}}
      ></div>
      <div
        className="gradient-layer"
        style={{  animationDelay: '1.6s', animationDuration: '19.2s'}}
      ></div>
      <div
        className="gradient-layer"
        style={{  animationDelay: '1.6s', animationDuration: '29.2s'}}
      ></div>
      <div
        className="gradient-layer"
        style={{  animationDelay: '1.6s', animationDuration: '20.2s'}}
      ></div>
      <button className={`gradient-btn ${btnClassName}`.trim()} onClick={eventButton}>{textButton}</button>
      <div className="text-overlay">{textButton}</div>
    </div>
  )
}
