export interface DockerContainer {
  id: string;
  image: string;
  command: string;
  created: string;
  status: string;
  ports: string;
  names: string;
}

export interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  created: string;
  size: string;
}
