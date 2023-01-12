export class CSectorLoader {
    rootpath: string;
    airportLoadWorker: Worker = new Worker('./_workload/airportLoader.js');
}

export default CSectorLoader;