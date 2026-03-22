import { useParams, Navigate } from 'react-router-dom';
import ConceptMatch from './ConceptMatch';
import { DebuggingRaceRun } from './DebuggingRace';
import CodeRearrangement from './CodeRearrangement';
import CodeCompletion from './CodeCompletion';

export default function TestRunner() {
  const { id } = useParams();

  // Map test ids from Tests.tsx to components
  switch (id) {
    case 't1':
      return <ConceptMatch />;
    case 't2':
      return <DebuggingRaceRun />;
    case 't3':
      return <CodeRearrangement />;
    case 't4':
      return <CodeCompletion />;
    default:
      // if id is missing or unknown, redirect back to tests list
      return <Navigate to="/tests" replace />;
  }
}
