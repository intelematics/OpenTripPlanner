/**
 * Copyright (C) 2011 Brian Ferris <bdferris@onebusaway.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.onebusaway2.gtfs.serialization;

import org.onebusaway2.gtfs.model.Agency;

import java.io.Serializable;
import java.util.List;

public interface GtfsReaderContext {

  public String getDefaultAgencyId();
  
  public String getTranslatedAgencyId(String agencyId);

  public List<Agency> getAgencies();

  public Object getEntity(Class<?> entityClass, Serializable id);

  public String getAgencyForEntity(Class<?> entityType, String entityId);
}
