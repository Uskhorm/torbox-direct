import FileParser from '../../vendor/aiostreams-source/parser/file.js';
import StreamSorter from '../../vendor/aiostreams-source/streams/sorter.js';
export {normaliseTitle} from '../../vendor/aiostreams-source/parser/title-normalise.js';
export const parseFile=(name:string)=>FileParser.parse(name);
export const sortNative=(streams:any[],profile:any,context:any)=>new StreamSorter(profile).sort(streams,context);
