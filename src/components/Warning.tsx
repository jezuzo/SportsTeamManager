
interface WarningProps {
  playerCount: number;
}

const Warning: React.FC<WarningProps> = ({ playerCount }) => {
  return (
    <div className="warning">
      This team has only <strong>{playerCount}</strong> players.  
      A full team requires at least 11 players!
    </div>
  );
};

export default Warning;