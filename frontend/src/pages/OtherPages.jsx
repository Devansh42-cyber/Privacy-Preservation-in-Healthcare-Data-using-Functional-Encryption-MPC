import React from 'react';

export function RecordsPage() {

  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {

    fetchRecords();

  }, []);

  const fetchRecords = async () => {

    try {

      const response = await fetch(
        'http://localhost:5000/api/records'
      );

      const data = await response.json();

      if (data.success) {

        setRecords(data.records);

      } else {

        setError('Failed to fetch records');
      }

    } catch (err) {

      console.error(err);

      setError('Backend connection failed');

    } finally {

      setLoading(false);
    }
  };



  return (

    <div
      style={{
        minHeight: '100%',
        background: '#020817',
        color: 'white',
        padding: '40px'
      }}
    >

      <h1
        style={{
          fontSize: '42px',
          marginBottom: '10px'
        }}
      >
        Encrypted Healthcare Records
      </h1>

      <p
        style={{
          color: '#94a3b8',
          marginBottom: '40px'
        }}
      >
      </p>


      {loading && (

        <div style={{ color: '#22d3ee' }}>
          Loading records...
        </div>
      )}


      {error && (

        <div
          style={{
            background: '#450a0a',
            border: '1px solid red',
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '20px',
            color: '#f87171'
          }}
        >
          {error}
        </div>
      )}


      <div
        style={{
          display: 'grid',
          gap: '20px'
        }}
      >

        {records.map((record) => (

          <div
            key={record._id}
            style={{
              background: '#0f172a',
              border: '1px solid #164e63',
              borderRadius: '18px',
              padding: '24px'
            }}
          >

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}
            >

              <div>

                <h2
                  style={{
                    color: '#22d3ee',
                    fontSize: '22px'
                  }}
                >
                  {record.record_id}
                </h2>

                <div
                  style={{
                    color: '#94a3b8',
                    fontSize: '14px'
                  }}
                >
                  Patient ID:
                  {record.patient_id}
                </div>

              </div>


              <div
                style={{
                  color: '#4ade80'
                }}
              >
                Encrypted ✓
              </div>

            </div>


            <div
              style={{
                display: 'grid',
                gap: '14px'
              }}
            >

              <div>
                <strong>Encrypted Age:</strong>
                <div>{record.encrypted_age}</div>
              </div>

              <div>
                <strong>Encrypted Gender:</strong>
                <div>{record.encrypted_gender}</div>
              </div>

              <div>
                <strong>Encrypted Disease:</strong>
                <div>{record.encrypted_disease}</div>
              </div>

              <div>
                <strong>Encrypted Blood Pressure:</strong>
                <div>{record.encrypted_blood_pressure}</div>
              </div>

              <div>
                <strong>Encrypted Risk Score:</strong>
                <div>{record.encrypted_risk_score}</div>
              </div>

            </div>


            <div
              style={{
                marginTop: '18px',
                fontSize: '12px',
                color: '#64748b'
              }}
            >
              Stored At:
              {' '}
              {new Date(record.timestamp)
                .toLocaleString()}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}


export function ResultsPage() {

  const [results, setResults] =
    React.useState([]);

  const [loading, setLoading] =
    React.useState(true);

  const [error, setError] =
    React.useState('');


  React.useEffect(() => {

    fetchResults();

  }, []);



  const fetchResults = async () => {

    try {

      const response = await fetch(
        'http://localhost:5000/api/results'
      );

      const data =
        await response.json();

      if (data.success) {

        setResults(data.results);

      } else {

        setError(
          'Failed to fetch results'
        );
      }

    } catch (err) {

      console.error(err);

      setError(
        'Backend connection failed'
      );

    } finally {

      setLoading(false);
    }
  };


  const diseaseMap = {

  '0': 'None',

  '1': 'Diabetes',

  '2': 'Hypertension',

  '3': 'Cardiac Disease',

  '4': 'Respiratory',

  '5': 'Neurological',

  null: 'Unknown'
};

  return (

    <div
      style={{
        minHeight: '100%',
        background: '#020817',
        color: 'white',
        padding: '40px'
      }}
    >

      <h1
        style={{
          fontSize: '42px',
          marginBottom: '10px'
        }}
      >
        Secure Computation Results
      </h1>

      <p
        style={{
          color: '#94a3b8',
          marginBottom: '40px'
        }}
      >
        Functional Encryption and MPC
        computation history
      </p>



      {loading && (

        <div
          style={{
            color: '#22d3ee'
          }}
        >
          Loading results...
        </div>
      )}



      {error && (

        <div
          style={{
            background: '#450a0a',
            border: '1px solid red',
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '20px',
            color: '#f87171'
          }}
        >
          {error}
        </div>
      )}



      <div
        style={{
          display: 'grid',
          gap: '20px'
        }}
      >

        {results.map((result) => (

          <div
            key={result._id}
            style={{
              background: '#0f172a',
              border: '1px solid #312e81',
              borderRadius: '18px',
              padding: '24px'
            }}
          >

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                marginBottom: '20px'
              }}
            >

              <div>

                <h2
                  style={{
                    color: '#a78bfa',
                    fontSize: '22px'
                  }}
                >
                  {result.result_id}
                </h2>

                <div
                  style={{
                    color: '#94a3b8',
                    fontSize: '14px'
                  }}
                >
                  Function:
                  {' '}
                  {result.function_type}
                </div>

              </div>


              <div
                style={{
                  color: '#4ade80'
                }}
              >
                Computed ✓
              </div>

            </div>



            <div
              style={{
                display: 'grid',
                gap: '14px'
              }}
            >

              <div>

  <strong>
    Aggregate Output
  </strong>
  

  {typeof result.computed_value ===
  'object'

    ? Object.entries(
        result.computed_value
      ).map(([key, value]) => (

        <div
          key={key}

          style={{
            display: 'flex',

            justifyContent:
              'space-between',

            alignItems: 'flex-start',

            gap: '20px',

            paddingBottom: '10px',

            borderBottom:
              '1px solid rgba(255,255,255,0.05)'
          }}
        >

          <span
            style={{
              color: '#94a3b8',

              textTransform:
                'capitalize'
            }}
          >
            {key.replaceAll(
              '_',
              ' '
            )}
          </span>



          <div
            style={{
              color: '#c4b5fd',

              fontWeight: 700,

              textAlign: 'right',

              maxWidth: '60%',

              whiteSpace:
                'pre-wrap',

              wordBreak:
                'break-word',

              fontSize: '12px',

              fontFamily:
                'monospace'
            }}
          >

            {Array.isArray(value)

  ? value.map((item, idx) => (

      <div
        key={idx}

        style={{
          marginBottom: '10px',

          paddingBottom: '10px',

          borderBottom:
            '1px solid rgba(255,255,255,0.05)'
        }}
      >

        <div
          style={{
            display: 'flex',

            justifyContent:
              'space-between'
          }}
        >

          <span>
            Disease
          </span>

          <span>
            {diseaseMap[item.name] ||
              item.name}
          </span>

        </div>

        <div
          style={{
            display: 'flex',

            justifyContent:
              'space-between',

            marginTop: '4px'
          }}
        >

          <span>
            Count
          </span>

          <span>
            {item.count}
          </span>

        </div>

      </div>
    ))

  : typeof value ===
    'object'

    ? JSON.stringify(
        value,
        null,
        2
      )

    : String(value)}

          </div>

        </div>
      ))

    : (

      <div
        style={{
          color: '#c4b5fd',

          fontWeight: 700
        }}
      >
        {String(
          result.computed_value
        )}
      </div>
    )}

</div>


</div>
            <div
              style={{
                marginTop: '18px',
                fontSize: '12px',
                color: '#64748b'
              }}
            >
              Generated At:
              {' '}
              {new Date(
                result.generated_time
              ).toLocaleString()}
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}


export function KeysPage() {
  const [rotatedKeys, setRotatedKeys] =
  React.useState([]);
  

  const keys = [

    {
      title:
        'FE Master Public Key',

      algorithm:
        'Functional Encryption',

      status: 'ACTIVE',

      fingerprint:
        'FEA7-91BC-442D',

      created:
        '2026-05-02',

      rotation:
        '90 days',

      color: '#20c8a0'
    },



    {
      title:
        'AES-256 Storage Key',

      algorithm:
        'AES-256-GCM',

      status: 'ACTIVE',

      fingerprint:
        'AES9-2FCD-77AA',

      created:
        '2026-05-01',

      rotation:
        '30 days',

      color: '#0ea5e9'
    },



    {
      title:
        'MPC Session Coordinator Key',

      algorithm:
        'Shamir Secret Sharing',

      status: 'ACTIVE',

      fingerprint:
        'MPC4-88EF-102B',

      created:
        '2026-05-05',

      rotation:
        'Session-based',

      color: '#8b5cf6'
    },



    {
      title:
        'FE Function Evaluation Key',

      algorithm:
        'Inner Product FE',

      status: 'RESTRICTED',

      fingerprint:
        'FEK2-45AB-90DD',

      created:
        '2026-05-06',

      rotation:
        'Dynamic',

      color: '#f59e0b'
    }

  ];


  return (

    <div
      style={{
        minHeight: '100%',
        background: '#020817',
        color: 'white',
        padding: '40px'
      }}
    >

      <div
        style={{
          marginBottom: 36
        }}
      >

        <h1
          style={{
            fontSize: '42px',
            marginBottom: '12px'
          }}
        >
          Key Management
        </h1>

        <p
          style={{
            color: '#94a3b8',
            maxWidth: '800px',
            lineHeight: 1.6
          }}
        >
          Administrative overview of
          cryptographic key metadata
          used across Functional Encryption,
          AES storage encryption,
          and MPC coordination services.
        </p>

      </div>



      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(320px, 1fr))',

          gap: '24px'
        }}
      >

        {keys.map((key, index) => (

          <div
            key={index}

            style={{
              background: '#0f172a',

              border:
                `1px solid ${key.color}40`,

              borderRadius: '20px',

              padding: '24px'
            }}
          >

            <div
              style={{
                display: 'flex',

                justifyContent:
                  'space-between',

                marginBottom: '18px'
              }}
            >

              <div>

                <div
                  style={{
                    fontSize: '20px',

                    color: key.color,

                    fontWeight: 700,

                    marginBottom: '6px'
                  }}
                >
                  {key.title}
                </div>

                <div
                  style={{
                    fontSize: '13px',

                    color: '#94a3b8'
                  }}
                >
                  {key.algorithm}
                </div>

              </div>



              <div
                style={{
                  height: 'fit-content',

                  padding:
                    '6px 12px',

                  borderRadius:
                    '999px',

                  fontSize: '11px',

                  fontWeight: 700,

                  background:
                    `${key.color}20`,

                  color: key.color
                }}
              >
                {key.status}
              </div>

            </div>


          


            <div
              style={{
                display: 'grid',
                gap: '14px'
              }}
            >

              <div>
                <strong>
                  Key Fingerprint:
                </strong>

                <div
                  style={{
                    color: '#cbd5e1',
                    marginTop: '4px'
                  }}
                >
                  {key.fingerprint}
                </div>
              </div>



              <div>
                <strong>
                  Created:
                </strong>

                <div
                  style={{
                    color: '#cbd5e1',
                    marginTop: '4px'
                  }}
                >
                  {key.created}
                </div>
              </div>



              <div>
                <strong>
                  Rotation Policy:
                </strong>

                <div
                  style={{
                    color: '#cbd5e1',
                    marginTop: '4px'
                  }}
                >
                  {key.rotation}
                </div>
              </div>

            </div>



            <button

  disabled={
    rotatedKeys.includes(key.title)
  }

  onClick={() => {

    setRotatedKeys(prev => [
      ...prev,
      key.title
    ]);
  }}

  style={{
    marginTop: '24px',

    width: '100%',

    padding: '12px',

    borderRadius: '12px',

    border:
      `1px solid ${key.color}40`,

    background:
      rotatedKeys.includes(key.title)
        ? 'rgba(148,163,184,0.12)'
        : `${key.color}15`,

    color:
      rotatedKeys.includes(key.title)
        ? '#94a3b8'
        : key.color,

    cursor:
      rotatedKeys.includes(key.title)
        ? 'not-allowed'
        : 'pointer',

    fontWeight: 600,

    opacity:
      rotatedKeys.includes(key.title)
        ? 0.7
        : 1
  }}
>

  {rotatedKeys.includes(key.title)
    ? 'Key Rotated'
    : 'Rotate Key'}

</button>

          </div>
        ))}

      </div>

    </div>
  );
}