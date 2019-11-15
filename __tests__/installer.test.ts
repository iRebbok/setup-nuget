import nock from 'nock';
import * as path from 'path';
import * as url from 'url';
import * as io from '@actions/io';
import * as fs from 'fs';

const toolDir = path.join(__dirname, 'runner', 'tools');
const tempDir = path.join(__dirname, 'runner', 'temp');
const IS_WINDOWS = process.platform === 'win32';
const HOST = 'https://dist.nuget.org';
const PATH = '/tools.json';
const TOOLS_JSON = {
  'nuget.exe': [
    {
      version: '5.3.1',
      url: 'https://dist.nuget.org/win-x86-commandline/v5.3.1/nuget.exe',
      stage: 'ReleasedAndBlessed',
      uploaded: '2019-10-24T21:00:00.0000000Z'
    },
    {
      version: '5.3.0',
      url: 'https://dist.nuget.org/win-x86-commandline/v5.3.0/nuget.exe',
      stage: 'ReleasedAndBlessed',
      uploaded: '2019-09-23T21:00:00.0000000Z'
    },
    {
      version: '5.3.0-preview3',
      url:
        'https://dist.nuget.org/win-x86-commandline/v5.3.0-preview3/nuget.exe',
      stage: 'EarlyAccessPreview',
      uploaded: '2019-09-04T17:00:00.0000000Z'
    },
    {
      version: '3.2.0',
      url: 'https://dist.nuget.org/win-x86-commandline/v3.2.0/nuget.exe',
      stage: 'Released',
      uploaded: '2015-09-16T14:00:00.0000000-07:00'
    },
    {
      version: '2.8.6',
      url: 'https://dist.nuget.org/win-x86-commandline/v2.8.6/nuget.exe',
      stage: 'ReleasedAndBlessed',
      uploaded: '2015-09-01T12:30:00.0000000-07:00'
    }
  ]
};
process.env['RUNNER_TOOL_CACHE'] = toolDir;
process.env['RUNNER_TEMP'] = tempDir;

import * as tc from '@actions/tool-cache';
import installer from '../src/installer';

describe('installer tests', () => {
  beforeAll(async () => {
    await io.rmRF(toolDir);
    await io.rmRF(tempDir);
  });

  afterAll(async () => {
    try {
      await io.rmRF(toolDir);
      await io.rmRF(tempDir);
    } catch {
      console.log('Failed to remove test directories');
    }
  }, 100000);

  test('installs nuget.exe', async () => {
    const srv = nock(HOST);
    srv.get(PATH).reply(200, TOOLS_JSON);
    const p = url.parse(TOOLS_JSON['nuget.exe'][0].url).path ?? '';
    srv.get(p).reply(200, 'abcd');
    await installer();
    expect(
      fs.readFileSync(
        path.join(tc.find('nuget.exe', '5.3.1'), 'nuget.exe'),
        'utf8'
      )
    ).toEqual('abcd');
    srv.done();
  });
});