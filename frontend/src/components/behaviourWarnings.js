const BehaviourWarnings = ({ warnings }) => {
  if (!warnings || warnings.length === 0) {
    return <p style={{ color: "green" }}>No behavioural risks detected.</p>;
  }

  return (
    <div>
      <h3>Behavioural Alerts</h3>
      {warnings.map((w, i) => (
        <div
          key={i}
          style={{
            borderLeft: "5px solid red",
            padding: "10px",
            marginBottom: "10px",
            background: "#fff3f3"
          }}
        >
          <strong>{w.type}</strong>
          <p>{w.message}</p>
        </div>
      ))}
    </div>
  );
};

export default BehaviourWarnings;
