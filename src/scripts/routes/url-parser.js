function extractPathnameSegments(path) {
  const pathWithoutQuery = path.split('?')[0];
  const splitUrl = pathWithoutQuery.split('/').filter(segment => segment !== '');

  return {
    resource: splitUrl[0] || null,
    id: splitUrl[1] || null,
    verb: splitUrl[2] || null
  };
}

function constructRouteFromSegments(pathSegments) {
  let pathname = '';

  if (pathSegments.resource) {
    pathname = `/${pathSegments.resource}`;
    
    if (pathSegments.id === 'add') {
      return `${pathname}/add`;
    }
    
    if (pathSegments.id) {
      pathname += '/:id';
      
      if (pathSegments.verb) {
        pathname += `/${pathSegments.verb}`;
      }
    }
  }

  return pathname || '/';
}

export function getActivePathname() {
  return location.hash.replace('#', '') || '/';
}

export function getActiveRoute() {
  const pathname = getActivePathname();
  
  if (pathname === '/stories/add') {
    return '/stories/add';
  }
  
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parseActivePathname() {
  const pathname = getActivePathname();
  return extractPathnameSegments(pathname);
}

export function getRoute(pathname) {
  if (pathname === '/stories/add') {
    return '/stories/add';
  }
  
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}