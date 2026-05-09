# pyrefly: ignore [missing-import]
from flask import Flask, request, jsonify
from flask_cors import CORS
from processor import run_pass1, run_pass2, MacroError

app = Flask(__name__)
CORS(app)

@app.route('/api/pass1', methods=['POST'])
def pass1_api():
    data = request.json
    source_code = data.get('source_code', '')
    
    try:
        result = run_pass1(source_code)
        return jsonify({
            'success': True,
            'data': result
        })
    except MacroError as e:
        return jsonify({
            'success': False,
            'error': e.to_dict()
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {"error": str(e), "line": None}
        }), 500

@app.route('/api/pass2', methods=['POST'])
def pass2_api():
    data = request.json
    intermediate_code = data.get('intermediate_code', '')
    mnt = data.get('mnt', [])
    mdt = data.get('mdt', [])
    
    try:
        expanded_code = run_pass2(intermediate_code, mnt, mdt)
        return jsonify({
            'success': True,
            'data': {
                'expanded_code': expanded_code
            }
        })
    except MacroError as e:
        return jsonify({
            'success': False,
            'error': e.to_dict()
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {"error": str(e), "line": None}
        }), 500

@app.route('/api/process_all', methods=['POST'])
def process_all_api():
    data = request.json
    source_code = data.get('source_code', '')
    
    try:
        # Pass 1
        p1_result = run_pass1(source_code)
        
        # Pass 2
        expanded_code = run_pass2(p1_result['intermediate_code'], p1_result['mnt'], p1_result['mdt'])
        
        return jsonify({
            'success': True,
            'data': {
                'mnt': p1_result['mnt'],
                'mdt': p1_result['mdt'],
                'ala': p1_result.get('ala', []),
                'intermediate_code': p1_result['intermediate_code'],
                'expanded_code': expanded_code
            }
        })
    except MacroError as e:
        return jsonify({
            'success': False,
            'error': e.to_dict()
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {"error": str(e), "line": None}
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
