import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WorkspaceProvider } from '@/lib/workspace';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import Index from '@/pages/Index';
import HubModel from '@/pages/HubModel';
import HubModels from '@/pages/HubModels';
import Sites, { SiteProforma } from '@/pages/Sites';
import Partners from '@/pages/Partners';
import Assumptions from '@/pages/Assumptions';
import Compare from '@/pages/Compare';
import CascadiaMap from '@/pages/CascadiaMap';
import SourceReview from '@/pages/SourceReview';
import ProjectNotes from '@/pages/ProjectNotes';
import SiteScorecard from '@/pages/SiteScorecard';
import NotFound from '@/pages/NotFound';
import AccessGate from '@/components/AccessGate';
export default function App() {
  return <TooltipProvider><Toaster richColors /><AccessGate><WorkspaceProvider><BrowserRouter><Routes><Route element={<WorkspaceLayout />}><Route path="/" element={<Sites />} /><Route path="/dashboard" element={<Index />} /><Route path="/model" element={<HubModel />} /><Route path="/hub-models" element={<HubModels />} /><Route path="/sites" element={<Navigate to="/" replace />} /><Route path="/sites/:id/proforma" element={<SiteProforma />} /><Route path="/scorecard" element={<SiteScorecard />} /><Route path="/partners" element={<Partners />} /><Route path="/assumptions" element={<Assumptions />} /><Route path="/compare" element={<Compare />} /><Route path="/map" element={<CascadiaMap />} /><Route path="/sources" element={<SourceReview />} /><Route path="/project-notes" element={<ProjectNotes />} /></Route><Route path="*" element={<NotFound />} /></Routes></BrowserRouter></WorkspaceProvider></AccessGate></TooltipProvider>;
}
