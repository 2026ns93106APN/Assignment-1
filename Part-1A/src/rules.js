export function validateR001(manifest) {
  const id = manifest?.['sap.app']?.id;
  if (id === undefined || id === null) {
    return { id: 'R-001', status: 'FAIL', message: 'sap.app.id is missing' };
  }
  if (typeof id !== 'string') {
    return { id: 'R-001', status: 'FAIL', message: `sap.app.id has wrong type: ${typeof id}` };
  }
  const segments = id.split('.');
  if (segments.length < 2 || !segments.every((s) => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s))) {
    return { id: 'R-001', status: 'FAIL', message: 'sap.app.id is invalid' };
  }
  return { id: 'R-001', status: 'PASS', message: '' };
}

export function validateR002(manifest) {
  const type = manifest?.['sap.app']?.type;
  if (type === undefined || type === null) {
    return { id: 'R-002', status: 'FAIL', message: 'sap.app.type is missing' };
  }
  if (typeof type !== 'string') {
    return { id: 'R-002', status: 'FAIL', message: `sap.app.type has wrong type: ${typeof type}` };
  }
  const validTypes = ['application', 'component', 'library'];
  if (!validTypes.includes(type)) {
    return { id: 'R-002', status: 'FAIL', message: `sap.app.type must be one of ${validTypes.join(', ')}` };
  }
  return { id: 'R-002', status: 'PASS', message: '' };
}

export function validateR003(manifest) {
  const rootView = manifest?.['sap.ui5']?.rootView;
  if (rootView === undefined || rootView === null) {
    return { id: 'R-003', status: 'FAIL', message: 'sap.ui5.rootView is missing' };
  }
  if (typeof rootView === 'string') {
    if (rootView.trim().length === 0) {
      return { id: 'R-003', status: 'FAIL', message: 'sap.ui5.rootView string cannot be empty' };
    }
    return { id: 'R-003', status: 'PASS', message: '' };
  }
  if (typeof rootView === 'object' && !Array.isArray(rootView)) {
    const viewName = rootView.viewName;
    if (typeof viewName !== 'string' || viewName.trim().length === 0) {
      return { id: 'R-003', status: 'FAIL', message: 'sap.ui5.rootView object viewName must be a non-empty string' };
    }
    return { id: 'R-003', status: 'PASS', message: '' };
  }
  return { id: 'R-003', status: 'FAIL', message: `sap.ui5.rootView has wrong type: ${typeof rootView}` };
}

export function validateR004(manifest) {
  const models = manifest?.['sap.ui5']?.models;
  if (models === undefined || models === null) {
    return { id: 'R-004', status: 'PASS', message: '' };
  }
  if (typeof models !== 'object' || Array.isArray(models)) {
    return { id: 'R-004', status: 'FAIL', message: 'sap.ui5.models must be an object' };
  }

  const dataSources = manifest?.['sap.app']?.dataSources;
  const offendingModels = [];

  for (const [modelName, modelConfig] of Object.entries(models)) {
    if (modelConfig && typeof modelConfig === 'object' && 'dataSource' in modelConfig) {
      const dsKey = modelConfig.dataSource;
      if (
        !dataSources ||
        typeof dataSources !== 'object' ||
        Array.isArray(dataSources) ||
        typeof dsKey !== 'string' ||
        !(dsKey in dataSources)
      ) {
        offendingModels.push(modelName);
      }
    }
  }

  if (offendingModels.length > 0) {
    return {
      id: 'R-004',
      status: 'FAIL',
      message: `Models referencing missing dataSources: ${offendingModels.join(', ')}`,
    };
  }

  return { id: 'R-004', status: 'PASS', message: '' };
}

export function validateR005(manifest) {
  const version = manifest?.['sap.ui5']?.dependencies?.minUI5Version;
  if (version === undefined || version === null) {
    return { id: 'R-005', status: 'FAIL', message: 'minUI5Version is missing' };
  }
  if (typeof version !== 'string') {
    return { id: 'R-005', status: 'FAIL', message: `minUI5Version has wrong type: ${typeof version}` };
  }
  const parts = version.split('.');
  if (parts.length !== 2 && parts.length !== 3) {
    return { id: 'R-005', status: 'FAIL', message: 'minUI5Version is invalid' };
  }
  for (const part of parts) {
    if (part.length === 0) {
      return { id: 'R-005', status: 'FAIL', message: 'minUI5Version is invalid' };
    }
    for (let i = 0; i < part.length; i++) {
      const code = part.charCodeAt(i);
      if (code < 48 || code > 57) {
        return { id: 'R-005', status: 'FAIL', message: 'minUI5Version is invalid' };
      }
    }
  }
  return { id: 'R-005', status: 'PASS', message: '' };
}

export function validateR006(manifest) {
  const i18n = manifest?.['sap.app']?.i18n;
  if (i18n === undefined || i18n === null) {
    return { id: 'R-006', status: 'FAIL', message: 'sap.app.i18n is missing' };
  }
  if (typeof i18n === 'string') {
    if (i18n.trim().length === 0) {
      return { id: 'R-006', status: 'FAIL', message: 'sap.app.i18n string cannot be empty' };
    }
    return { id: 'R-006', status: 'PASS', message: '' };
  }
  if (typeof i18n === 'object' && !Array.isArray(i18n)) {
    const bundleUrl = i18n.bundleUrl;
    if (typeof bundleUrl !== 'string' || bundleUrl.trim().length === 0) {
      return { id: 'R-006', status: 'FAIL', message: 'sap.app.i18n object bundleUrl must be a non-empty string' };
    }
    return { id: 'R-006', status: 'PASS', message: '' };
  }
  return { id: 'R-006', status: 'FAIL', message: `sap.app.i18n has wrong type: ${typeof i18n}` };
}

export function validateManifest(manifest) {
  return [
    validateR001(manifest),
    validateR002(manifest),
    validateR003(manifest),
    validateR004(manifest),
    validateR005(manifest),
    validateR006(manifest),
  ];
}
