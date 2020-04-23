'''
Created on Nov 15, 2019

@author: Amber Wright
'''
import mysql.connector
from mysql.connector import Error
import os,sys
import pyparsing as pp
import time
from datetime import datetime
import re
 
conn = None

# get all data files
states_path = 'C:\CIS550Data\Data\states.csv'
stations_path = 'C:\CIS550Data\Data\ghcnd-stations_USONLY.txt'
climatedata_dir = 'C:\CIS550Data\ghcnd_hcn-002\ghcnd_hcn'
stormdetails_dir = 'C:\CIS550Data\Data\storm_details\extracted'
stormlocations_dir = 'C:\CIS550Data\Data\storm_locations\extracted'

element_types = {
    'PRCP':1,
    'SNOW':2,
    'SNWD':3,
    'TMAX':4,
    'TMIN':5,
    'TAVG':6,
    'TOBS':7
}

states_dict = {}
 
def connect():
    """ Connect to MySQL database """
    try:
        conn = mysql.connector.connect(host='localhost',
                                       database='climate_data',
                                       user='root',
                                       password='root')
        if conn.is_connected():
            print('Connected to MySQL database')
 
    except Error as e:
        print(e)
 
    finally:
        if conn is not None and conn.is_connected():
            return conn
        else:
            return None 
              
def load_usstates_table(conn):
    cur = conn.cursor()
    load_data_flag = True;
    
    # check if the table already exists, set flag
    table_name = "us_states"
    cur.execute("SHOW TABLES LIKE '{}'".format(table_name))
    if cur.fetchone():
        print('US_STATES table already exists!')
        load_data_flag = False;
    
    # create table
    if (load_data_flag):
        cur.execute("CREATE TABLE {} (state_abbr VARCHAR(2) NOT NULL, state_name VARCHAR(35) NOT NULL, PRIMARY KEY(state_abbr))".format(table_name))  
    
    # open file and read first line
    print("Reading file {}".format(states_path))
    with open(states_path) as thisfile:
        #read line, which is the headers
        line = thisfile.readline().strip()
        # increment to skip headers line and move onto the next 
        line = thisfile.readline().strip()
        
        # loop over lines and insert into db
        while line:

            # parse the line into the data values we want
            line_split = line.split(',')
            STATE_ABBR = line_split[0].strip()
            STATE_NAME = line_split[1].strip()

            # insert into table
            if (load_data_flag):
                sql = "INSERT INTO {} (state_abbr, state_name) VALUES (%s, %s)".format(table_name)
                val = (STATE_ABBR, STATE_NAME)
                cur.execute(sql,val)
            
            states_dict[STATE_NAME.upper()] = STATE_ABBR
            
            # increment
            line = thisfile.readline().strip()

    # commit changes to the db so it actually does something
    if (load_data_flag):
        conn.commit()
        print("US States Table load completed in ", time.time()-start)

def load_stations_table(conn):
    cur = conn.cursor()
    stations_start_time = time.time()
    # check if the table already exists and exit if it does
    table_name = "stations"
    cur.execute("SHOW TABLES LIKE '{}'".format(table_name))
    if cur.fetchone():
        print('STATIONS table already exists!')
        return
    
    # create table
    cur.execute("CREATE TABLE {} (id VARCHAR(11) NOT NULL, latitude REAL NOT NULL, longitude REAL NOT NULL, elevation REAL NOT NULL, state VARCHAR(2), name VARCHAR(30), PRIMARY KEY(id), FOREIGN KEY (state) REFERENCES us_states(state_abbr))".format(table_name))  
    
    # open file and read first line
    print("Reading file {}".format(stations_path))
    with open(stations_path) as thisfile:
        line = thisfile.readline().strip()
        
        counter = 0
        
        # loop over lines and insert into db
        while line:
            
            # counters are fun. they let you know the code is running
            counter += 1
            if counter%10000 == 0:
                print("Processing line #{} at {} seconds".format(counter, time.time()-stations_start_time))

            # parse the line into the data values we want
            ID        = line[0:11].strip()
            LATITUDE  = float(line[12:20].strip())
            LONGITUDE = float(line[21:30].strip())
            ELEVATION = float(line[31:37].strip())
            STATE     = line[38:40].strip()
            NAME      = line[41:71].strip()
            
            #print("station = {}".format(ID))
            
            # insert into table
            sql = "INSERT INTO {} (id, latitude, longitude, elevation, state, name) VALUES (%s, %s, %s, %s, %s, %s)".format(table_name)
            val = (ID, LATITUDE, LONGITUDE, ELEVATION, STATE, NAME)
            cur.execute(sql,val)
            
            # increment
            line = thisfile.readline().strip()

    # commit changes to the db so it actually does something
    conn.commit()
    print("Station Table load completed in ", time.time()-stations_start_time)
    
    
            
def load_climatedata_table(conn):
    cur = conn.cursor()
    climatedata_start_time = time.time()
    filesdir = climatedata_dir
    
    # get all data files
    files = os.listdir(filesdir)
    
    # check if the table already exists and exit if it does
    table_name = "climate_elements1"
    cur.execute("SHOW TABLES LIKE '{}'".format(table_name))
    if cur.fetchone():
        #sys.exit("FATAL: Table already exists!")
        print("CLIMATE_ELEMENTS table already exists!")
        return
    
    # create table
    cur.execute(
    ("CREATE TABLE {}"+ 
       "(id VARCHAR(11) NOT NULL, date_time DATETIME NOT NULL,"+
       "prcp INT, snow INT, snwd INT,  tmax REAL, tmin REAL, tavg REAL, tobs REAL,"+
       "PRIMARY KEY(id, date_time), FOREIGN KEY (id) REFERENCES stations(id))").format(table_name))

    
    # loop over all files
    pcounter = 0         #counter for processing lines
    lcounter = 0         #counter for loading lines
    file_counter = 0

    for f in files:
        
        file_counter +=1
        
        # open file and read first line
        print("Reading file {} {}".format(file_counter,f))
        with open(filesdir+'/'+f) as thisfile:
            climate_dict = {}
            
            # start reading the first line in the file
            line = thisfile.readline().strip()
            #print(line)
            
            # loop over lines and insert into dictionary
            while line:
                # counters are fun. they let you know the code is running
                pcounter += 1
                if pcounter%10000 == 0:
                    print("Processing line #{} at {} seconds".format(pcounter, time.time()-climatedata_start_time))
    
                # parse the line into the data values we want
                ID      = line[0:11].strip()
                YEAR    = line[11:15].strip()
                MONTH   = line[15:17].strip()
                ELEMENT = line[17:21].strip()
                QFLAG   = line[27:27].strip()
                #print("values for |"+ID+"| |"+str(YEAR)+"| |"+str(MONTH)+"| |"+ELEMENT+"| |"+QFLAG+"|")
    
                
                if ((ELEMENT == 'PRCP') or (ELEMENT == 'SNOW') or (ELEMENT == 'SNWD') or 
                    (ELEMENT == 'TMAX') or (ELEMENT == 'TMIN') or (ELEMENT == 'TAVG') or 
                    (ELEMENT == 'TOBS')):
                    
                    for i in range(1,32):
                        
                        # create string for date YYYY-MM-DD
                        if i < 10:
                            date = YEAR+'-'+MONTH+'-'+'0'+str(i)
                        else:
                            date = YEAR+'-'+MONTH+'-'+str(i)    
                        
                        #dictionary [date]:[0:ID, 1:PRCP, 2:SNOW, 3:SNWD, 4:TMAX, 5:TMIN, 6:TAVG]
                        index = element_types[ELEMENT]
                        
                        #get the value
                        offset = 21+((i-1)*8)
                        V  = int(line[offset:offset+5].strip())
                        Q  = line[offset+6:offset+7].strip()
                        #print('Q is {}'.format(Q))
                        
                        #do not add to the dictionary if the value is "null" aka -9999 or if Q is not ''
                        if (V != -9999 and Q == ''):
                            # initialize entry in dictionary where the key is the date 
                            if not date in climate_dict:
                                climate_dict[date] = [ID]+[-9999]*7
                            
                            #change the temperature so it is in C degrees (not tenths of C)    
                            if ((ELEMENT == 'TMAX') or (ELEMENT == 'TMIN') or (ELEMENT == 'TAVG') or (ELEMENT == 'TOBS')):
                                V=V/10  
                            
                            #add value to the dictionary key
                            climate_dict[date][index]=V

                # increment
                line = thisfile.readline().strip()
                #print(line)
    
        #now that dictionary for the file is created, need to loop through and insert into db
        for key, values in climate_dict.items():
            values.append(key)
            val = (values)
            #print(val)
    
            lcounter += 1
            if lcounter%10000 == 0:
                print("Loading line #{} at {} seconds".format(lcounter, time.time()-climatedata_start_time))
            # insert into table
            sql = ("INSERT INTO {} (id, prcp, snow, snwd, tmax, tmin, tavg, tobs, date_time"+
                ") VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)").format(table_name)
            cur.execute(sql,val)
        
    # commit changes to the db so it actually does something
    conn.commit()
    print("Climate Table load completed in ", time.time()-climatedata_start_time)

def load_stormdetails_table(conn):
    cur = conn.cursor()
    stormdetails_start_time = time.time()
    filesdir = stormdetails_dir
    
    # get all data files
    files = os.listdir(filesdir)
    
    # check if the table already exists and exit if it does
    table_name = "storm_details"
    tor_table_name = "tornado_details"
    cur.execute("SHOW TABLES LIKE '{}'".format(table_name))
    if cur.fetchone():
        #sys.exit("FATAL: Table already exists!")
        print("STORM_DETAILS table already exists!")
        return
    
    # create table
    # REMINDER: event_id is the key NOT episode_id
    cur.execute(
        ("CREATE TABLE {} (year INT, month_name VARCHAR(20), begin_date_time DATETIME, end_date_time DATETIME, cz_timezone VARCHAR(10), episode_id INT, event_id INT NOT NULL, event_type VARCHAR(50),"+
                                "injuries_direct INT, injuries_indirect INT, deaths_direct INT, deaths_indirect INT, damage_property REAL, damage_crops REAL, magnitude REAL, magnitude_type VARCHAR(5),"+
                                "flood_cause VARCHAR(50), episode_narrative TEXT, event_narrative TEXT, state VARCHAR(2),"+
                                "PRIMARY KEY (event_id),"+
                                "FOREIGN KEY (state) REFERENCES us_states(state_abbr))").format(table_name) )
    #DONE: Add in the foreign reference to the states, but also need to change the state value from full name to abbreviation
    #DONE: Convert the BEGIN_DATE_TIME and END_DATE_TIME to DATETIME types 
    #DONE: DAMAGE_PROPERTY and DAMAGE_CROPS are not numbers, they have a 'K' or 'M' after the number, consider cleaning this up
    
    cur.execute(
        ("CREATE TABLE {} (event_id INT NOT NULL, episode_id INT, tor_length REAL, tor_width REAL, tor_f_scale VARCHAR(3),"+
         "tor_other_state VARCHAR(50), tor_other_name VARCHAR(50),"+
         "PRIMARY KEY (event_id),"+
         "FOREIGN KEY (event_id) REFERENCES storm_details(event_id)"+
         ")").format(tor_table_name)
        )
    #DONE: Convert the states to code and create a foreign key to the states table 
    #NVM: For some reason I am struggling to make the episode_id a foreign key to the storm_details table
    #FOREIGN KEY (episode_id) REFERENCES storm_details(episode_id)
    #OK, episode_id cannot be a key because the value does not exist for all rows
    #DONE: change the dates to datetimes for mysql
    #DONE: normalize the floods to just one flood value
    #DONE: change the damage amounts into actual numbers
    #DONE: split out year and month from YEAR value, ex) 201608
    
    # loop over all files
    counter = 0
    file_counter = 0
    for f in files:
        
        file_counter +=1
        
        # open file and read first line
        print("Reading file {} {}".format(file_counter,f))
        with open(filesdir+'/'+f, encoding="utf-8") as thisfile:
            line = thisfile.readline().strip()
            
            # increment to skip the first line with headers
            line = thisfile.readline().strip()
            
            # loop over lines and insert into db
            while line:
                # counters are fun. they let you know the code is running
                counter += 1
                if counter%10000 == 0:
                    print("Processing line #{} at {} seconds".format(counter, time.time()-stormdetails_start_time))
    
                # parse the line into the data values we want
                #line_split = line.split(',')
                line_split = pp.commaSeparatedList.parseString(line).asList()
                #print("line is = ", line_split)
                
                # only proceed to load the line if the state is a valid state
                STATE                  = line_split[8].strip(' "')
                
                # change the value for state to the abbreviation
                if STATE in states_dict:
                    STATE = states_dict[STATE]
                
                    YEARMO              = line_split[0].strip(' "')
                    YEAR                = YEARMO[0:4]
                    MONTH_NAME          = line_split[11].strip(' "')
                    BEGIN_DATE_TIME     = line_split[17].strip(' "')
                    BEGIN_DATE_TIME     = convert_date_string(BEGIN_DATE_TIME)
                    END_DATE_TIME       = line_split[19].strip(' "')
                    END_DATE_TIME       = convert_date_string(END_DATE_TIME)
                    CZ_TIMEZONE         = line_split[18].strip(' "')
                    EPISODE_ID          = line_split[6].strip(' "')
                    if EPISODE_ID == "":
                        EPISODE_ID = None  
                    EVENT_ID            = line_split[7].strip(' "')
                    EVENT_TYPE          = line_split[12].strip(' "')
                    if "flood" in EVENT_TYPE:
                        EVENT_TYPE = "Flood"
                    INJURIES_DIRECT     = line_split[20].strip(' "')
                    INJURIES_INDIRECT   = line_split[21].strip(' "')
                    DEATHS_DIRECT       = line_split[22].strip(' "')
                    DEATHS_INDIRECT     = line_split[23].strip(' "')
                    DAMAGE_PROPERTY     = line_split[24].strip(' "')
                    DAMAGE_PROPERTY     = convert_damage_to_num(DAMAGE_PROPERTY)
                    DAMAGE_CROPS        = line_split[25].strip(' "')
                    DAMAGE_CROPS        = convert_damage_to_num(DAMAGE_CROPS)
                    MAGNITUDE           = line_split[27].strip(' "')
                    if MAGNITUDE == "":
                        MAGNITUDE = None
                    MAGNITUDE_TYPE      = line_split[28].strip(' "')
                    FLOOD_CAUSE         = line_split[29].strip(' "')
                    #EPISODE_TITLE       = line_split[].strip() not in the data even though it mentions it in the readme
                    EPISODE_NARRATIVE   = line_split[48].strip(' "')
                    EVENT_NARRATIVE     = line_split[49].strip(' "')
                     
                    #Tornado Data
                    TOR_LENGTH          = line_split[32].strip(' "')
                    if TOR_LENGTH == "":
                        TOR_LENGTH = None
                    TOR_WIDTH           = line_split[33].strip(' "')
                    if TOR_WIDTH == "":
                        TOR_WIDTH = None
                    TOR_F_SCALE         = line_split[31].strip(' "')
                    TOR_OTHER_STATE     = line_split[35].strip(' "')
                    TOR_OTHER_NAME      = line_split[37].strip(' "')
                    
                    
                    #DONE: Need to change all the floods to one type of flood
        
                    # insert into table
                    sql = ("INSERT INTO {} (year, month_name, begin_date_time, end_date_time, cz_timezone, episode_id, event_id, event_type, injuries_direct, injuries_indirect, deaths_direct,"+
                                            "deaths_indirect, damage_property, damage_crops, magnitude, magnitude_type, flood_cause, episode_narrative, event_narrative, state) "+
                                            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)").format(table_name)
                    val = (YEAR, MONTH_NAME, BEGIN_DATE_TIME, END_DATE_TIME, CZ_TIMEZONE, EPISODE_ID, EVENT_ID, EVENT_TYPE, INJURIES_DIRECT, INJURIES_INDIRECT, DEATHS_DIRECT, DEATHS_INDIRECT,
                            DAMAGE_PROPERTY, DAMAGE_CROPS, MAGNITUDE, MAGNITUDE_TYPE, FLOOD_CAUSE, EPISODE_NARRATIVE, EVENT_NARRATIVE, STATE)
                    #print("sql statement: ", sql)
                    #print("val : ",val)
                    cur.execute(sql,val)
                    
                    # insert into table
                    if (TOR_F_SCALE != ""):
                        sql = ("INSERT INTO {} (event_id, episode_id, tor_length, tor_width, tor_f_scale, tor_other_state, tor_other_name)"+
                                                "VALUES (%s, %s, %s, %s, %s, %s, %s)").format(tor_table_name)
                        val = (EVENT_ID, EPISODE_ID, TOR_LENGTH, TOR_WIDTH, TOR_F_SCALE, TOR_OTHER_STATE, TOR_OTHER_NAME)
                        #print("val : ",val)
                        cur.execute(sql,val)
                
                # increment
                line = thisfile.readline().strip()
    
    # commit changes to the db so it actually does something
    conn.commit()   
    print("Storm Details Table & Tornados Details Table load completed in ", time.time()-stormdetails_start_time) 

    
def load_stormlocations_table(conn):
    cur = conn.cursor()
    stormlocations_start_time = time.time()
    filesdir = stormlocations_dir
     
    # get all data files
    files = os.listdir(filesdir)
     
    # check if the table already exists and exit if it does
    table_name = "storm_locations"
    cur.execute("SHOW TABLES LIKE '{}'".format(table_name))
    if cur.fetchone():
        #sys.exit("FATAL: Table already exists!")
        print("STORM_LOCATIONS table already exists!")
        return
     
    # create table
    cur.execute(
        ("CREATE TABLE {} (event_id INT NOT NULL, episode_id INT, location_index INT, center_range REAL,"+
                                "azimuth VARCHAR(3), location VARCHAR(50), latitude REAL, longitude REAL,"+
                                "PRIMARY KEY(event_id, location_index),"+
                                "FOREIGN KEY (event_id) REFERENCES storm_details(event_id)"+
                                ")").format(table_name) )
    # same here, not sure why I can't add a Foreign key for episode id. Maybe there are duplicate values?
    # FOREIGN KEY (episode_id) REFERENCES storm_details(episode_id)
    # can't make episode_id a foreign key because in some cases it is null
    #NVM: Add foreign key reference, removing for testing
    
    
    # loop over all files
    counter = 0
    file_counter = 0
    skipped_lines = 0
    for f in files:
         
        file_counter +=1
         
        # open file and read first line
        print("Reading file {} {}".format(file_counter,f))
        with open(filesdir+'/'+f, encoding="utf-8") as thisfile:
            line = thisfile.readline().strip()
             
            # increment to skip the first line with headers
            line = thisfile.readline().strip()
             
            # loop over lines and insert into db
            while line:
                # counters are fun. they let you know the code is running
                counter += 1
                if counter%10000 == 0:
                    print("Processing line #{} at {} seconds".format(counter, time.time()-stormlocations_start_time))
     
                # parse the line into the data values we want
                #line_split = line.split(',')
                line_split = pp.commaSeparatedList.parseString(line).asList()
                #print("line is = ", line_split)
                 
                EPISODE_ID          = line_split[1].strip(' "')
                if EPISODE_ID == "":
                    EPISODE_ID = None  
                EVENT_ID            = line_split[2].strip(' "')
                LOCATION_INDEX      = line_split[3].strip(' "')
                CENTER_RANGE        = line_split[4].strip(' "')
                if CENTER_RANGE == "":
                    CENTER_RANGE = None 
                AZIMUTH             = line_split[5].strip(' "')
                LOCATION            = line_split[6].strip(' "')
                LATITUDE            = line_split[7].strip(' "')
                if LATITUDE == "":
                    LATITUDE = None
                LONGITUDE           = line_split[8].strip(' "')
                if LONGITUDE == "":
                    LONGITUDE = None
     
                try:
                    # insert into table
                    sql = ("INSERT INTO {} (event_id, episode_id, location_index, center_range, azimuth, location, latitude, longitude) "+
                                            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)").format(table_name)
                    val = (EVENT_ID, EPISODE_ID, LOCATION_INDEX, CENTER_RANGE, AZIMUTH, LOCATION, LATITUDE, LONGITUDE)
                    #print("sql statement: ", sql)
                    #print("val : ",val)
                    cur.execute(sql,val)
                except mysql.connector.errors.IntegrityError:
                    #removed lines from storm_details so some of the foreign ket references fail, we dont need these lines anyways if the episode id was removed
                    #print("skipping adding {}".format(EPISODE_ID))
                    skipped_lines += 1
                 
                # increment
                line = thisfile.readline().strip()
     
    # commit changes to the db so it actually does something
    conn.commit()   
    print("Storm Locations Table load completed in ", time.time()-stormlocations_start_time) 
    print("Lines Skipped: {}".format(skipped_lines))


def convert_date_string(date_str):
    #the original string is in the format dd-mm-yy hh:mm:ss
    #need to change it to YYYY-MM-DD HH:MM:SS
    date_obj = datetime.strptime(date_str, '%d-%b-%y %H:%M:%S')
    return date_obj.strftime('%Y-%m-%d %H:%M:%S')


def convert_damage_to_num(damage_str):
    #check to see if any of the characters in the string are integers
    #if they are not, then return None
    if (bool(re.search(r'\d', damage_str))):
        try:
            damage = float(damage_str)
        except ValueError:
            damage = damage_str[:-1]
            quantifier = damage_str[-1].toupper()
            if "H" in quantifier:
                damage = float(damage)*1E2
            elif "K" in quantifier:
                damage = float(damage)*1E3
            elif "M" in quantifier:
                damage = float(damage)*1E6
            elif "B" in quantifier:
                damage = float(damage)*1E9
            elif "T" in quantifier:
                damage = float(damage)*1E12
            else:
                print('need new damage calculation for '+quantifier) 
                damage = None
    else:
        damage = None
    return damage

    
def closeall():
    conn.close()
    sys.exit(1)    
 
 
if __name__ == '__main__':
    conn = connect()
    if conn is not None and conn.is_connected():
        start = time.time()
        #load_usstates_table(conn)
        #load_stations_table(conn)
        load_climatedata_table(conn)
        #load_stormdetails_table(conn)
        #load_stormlocations_table(conn)
        print("All Tables load completed in ", time.time()-start)
    closeall()
            