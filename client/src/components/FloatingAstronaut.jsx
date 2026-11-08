export default function FloatingAstronaut() {
  return (
    <div className="astronaut-scene" aria-label="Floating astronaut illustration">
      <span className="space-star star-one" />
      <span className="space-star star-two" />
      <span className="space-star star-three" />
      <span className="space-orbit" />
      <div className="astronaut">
        <span className="astronaut-backpack" />
        <span className="astronaut-helmet"><i /></span>
        <span className="astronaut-neck" />
        <span className="astronaut-body"><i className="chest-panel">S</i></span>
        <span className="astronaut-arm arm-left" />
        <span className="astronaut-arm arm-right" />
        <span className="astronaut-leg leg-left" />
        <span className="astronaut-leg leg-right" />
        <span className="astronaut-boot boot-left" />
        <span className="astronaut-boot boot-right" />
      </div>
      <span className="astronaut-tether" />
      <span className="astronaut-shadow" />
    </div>
  )
}
