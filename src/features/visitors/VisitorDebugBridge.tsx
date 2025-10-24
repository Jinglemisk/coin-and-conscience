import { useEffect } from 'react';
import { registerVisitorDebugApi } from './visitorDebug';

export const VisitorDebugBridge = () => {
  useEffect(() => registerVisitorDebugApi(), []);
  return null;
};
