export default function LandingPage() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        color: "white",
        fontFamily: "Inter, Arial, sans-serif",
        textAlign: "center",
        padding: "20px"
      }}
    >
      <h1
        style={{
          fontSize: "56px",
          marginBottom: "20px",
          fontWeight: 700
        }}
      >
        DomainDrip.ai is For Sale
      </h1>

      <p
        style={{
          fontSize: "22px",
          opacity: 0.9,
          marginBottom: "10px"
        }}
      >
        Premium AI branding domain
      </p>

      <p
        style={{
          fontSize: "20px",
          marginTop: "30px",
          fontWeight: 600
        }}
      >
        george@fig-io.com
      </p>
    </div>
  )
}
